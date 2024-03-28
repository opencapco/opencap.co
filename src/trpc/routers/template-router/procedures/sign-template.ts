/* eslint-disable @typescript-eslint/prefer-for-of */

import { PDFDocument, StandardFonts } from "pdf-lib";
import { publicProcedure, type CreateTRPCContextType } from "@/trpc/api/trpc";
import { ZodSignTemplateMutationSchema } from "../schema";
import { getFileFromS3, uploadFile } from "@/common/uploads";
import { createDocumentHandler } from "../../document-router/procedures/create-document";
import { createBucketHandler } from "../../bucket-router/procedures/create-bucket";
import { generateRange, type Range } from "@/lib/pdf-positioning";
import {
  EncodeEmailToken,
  SendEsignEmail,
} from "../../template-field-router/procedures/add-fields";

export const signTemplateProcedure = publicProcedure
  .input(ZodSignTemplateMutationSchema)
  .mutation(async ({ ctx, input }) => {
    const { db } = ctx;
    const template = await getTemplate(input.templateId, db);

    const bucketKey = template.bucket.key;
    const companyId = template.companyId;
    const templateName = template.name;

    const recipientList = await db.esignRecipient.findMany({
      where: {
        templateId: template.id,
      },
      select: {
        group: true,
        id: true,
        status: true,
      },
    });

    const totalGroups = new Set(recipientList.map((item) => item.group));

    const recipient = await db.esignRecipient.findFirstOrThrow({
      where: {
        id: input.recipientId,
        group: input.group,
        templateId: template.id,
      },
    });

    await db.esignRecipient.update({
      where: { id: recipient.id },
      data: { status: "SIGNED" },
    });

    if (totalGroups.size > 1) {
      const fields = template.fields.filter(
        (item) => item.group === input.group,
      );

      for (const field of fields) {
        const value = input?.data?.[field?.name];
        if (value) {
          await db.templateField.update({
            where: {
              id: field.id,
            },
            data: {
              prefilledValue: value,
            },
          });
        }
      }

      const signableRecepients = await db.esignRecipient.count({
        where: {
          templateId: template.id,
          status: "PENDING",
        },
      });

      if (signableRecepients === 0) {
        const values = await db.templateField.findMany({
          where: {
            templateId: template.id,
            prefilledValue: {
              not: null,
            },
          },
          select: {
            name: true,
            prefilledValue: true,
          },
        });

        const data = values.reduce<Record<string, string>>((prev, curr) => {
          prev[curr.name] = curr.prefilledValue ?? "";

          return prev;
        }, {});

        await signPdf({
          bucketKey,
          companyId,
          ctx,
          templateName,
          fields: template.fields,
          uploaderName: "open cap",
          data,
        });
      }
    } else {
      await signPdf({
        bucketKey,
        companyId,
        ctx,
        templateName,
        fields: template.fields,
        uploaderName: recipient.name ?? "unknown signer",
        data: input.data,
      });
    }

    if (template.orderedDelivery) {
      const nextDelivery = await db.esignRecipient.findFirst({
        where: {
          templateId: template.id,
          status: "PENDING",
        },
        select: {
          id: true,
          email: true,

          group: true,
        },
      });
      if (nextDelivery) {
        const token = await EncodeEmailToken({
          group: nextDelivery.group,
          recipientId: nextDelivery.id,
          templateId: template.id,
        });
        const email = nextDelivery.email;

        await SendEsignEmail({ token, email });
      }
    }

    return {};
  });

function getTemplate(id: string, db: CreateTRPCContextType["db"]) {
  return db.template.findFirstOrThrow({
    where: { id },
    select: {
      bucket: true,
      fields: {
        orderBy: {
          top: "asc",
        },
      },
      companyId: true,
      id: true,
      name: true,
      orderedDelivery: true,
    },
  });
}

type TGetTemplate = Awaited<ReturnType<typeof getTemplate>>;

interface TSignPdfOptions {
  ctx: CreateTRPCContextType;
  bucketKey: string;
  companyId: string;
  templateName: string;
  data: Record<string, string>;
  fields: TGetTemplate["fields"];
  uploaderName: string;
}

async function signPdf({
  ctx,
  bucketKey,
  companyId,
  templateName,
  data,
  fields,
  uploaderName,
}: TSignPdfOptions) {
  const { db, requestIp, userAgent } = ctx;

  const docBuffer = await getFileFromS3(bucketKey);
  const pdfDoc = await PDFDocument.load(docBuffer);

  const pages = pdfDoc.getPages();

  let cumulativePagesHeight = 0;
  const measurements = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (page) {
      const height = page.getHeight();
      const width = page.getWidth();
      cumulativePagesHeight += height;
      measurements.push({ height, width });
    }
  }

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 8;
  const textHeight = font.heightAtSize(fontSize);

  const pageRangeCache: Record<string, Range[]> = {};

  for (const field of fields) {
    const value = data?.[field?.name];

    if (value) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const pageNumber: number = field.page;

      const page = pages.at(pageNumber);

      if (!page) {
        throw new Error("page not found");
      }

      const cacheKey = String(field.viewportHeight);
      let pagesRange = pageRangeCache?.[cacheKey];

      if (!pagesRange) {
        const range = generateRange(measurements, field.viewportWidth);
        pageRangeCache[cacheKey] = range;
        pagesRange = range;
      }

      const { width: pageWidth, height: pageHeight } = page.getSize();
      const topMargin = pagesRange?.[pageNumber]?.[0] ?? 0;

      const widthRatio = pageWidth / field.viewportWidth;

      const totalHeightRatio = cumulativePagesHeight / field.viewportHeight;

      const fieldX = field.left * widthRatio;

      const top = field.top - topMargin;
      const fieldY = top * widthRatio;
      const width = field.width * widthRatio;
      const height = field.height * totalHeightRatio;

      if (field.type === "SIGNATURE") {
        const image = await pdfDoc.embedPng(value);

        const updatedY = fieldY + height;

        page.drawImage(image, {
          x: fieldX,
          y: pageHeight - updatedY,
          width,
          height,
        });
      } else {
        const padding = (height + textHeight) / 2;
        page.drawText(value, {
          x: fieldX,
          y: pageHeight - fieldY - padding,
          font,
          size: fontSize,
        });
      }
    }
  }

  const modifiedPdfBytes = await pdfDoc.save();

  const file = {
    name: templateName,
    type: "application/pdf",
    arrayBuffer: async () => Promise.resolve(Buffer.from(modifiedPdfBytes)),
    size: 0,
  } as unknown as File;

  const { fileUrl: _fileUrl, ...bucketData } = await uploadFile(file, {
    identifier: companyId,
    keyPrefix: "generic-document",
  });

  const { id: bucketId, name } = await createBucketHandler({
    db,
    input: bucketData,
  });

  await createDocumentHandler({
    input: { bucketId, name },
    requestIp,
    db,
    userAgent,
    companyId,
    uploaderName,
  });
}
