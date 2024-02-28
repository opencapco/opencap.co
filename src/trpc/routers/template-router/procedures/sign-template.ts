import { PDFDocument, StandardFonts } from "pdf-lib";
import { withAuth } from "@/trpc/api/trpc";
import { ZodSignTemplateMutationSchema } from "../schema";
import { getFileFromS3, uploadFile } from "@/common/uploads";
import { createDocumentHandler } from "../../document-router/procedures/create-document";
import { createBucketHandler } from "../../bucket-router/procedures/create-bucket";

export const signTemplateProcedure = withAuth
  .input(ZodSignTemplateMutationSchema)
  .mutation(async ({ ctx, input }) => {
    const { db, session } = ctx;

    const user = session.user;

    const template = await db.template.findFirstOrThrow({
      where: { publicId: input.templatePublicId },
      include: {
        fields: {
          orderBy: {
            top: "asc",
          },
        },
        bucket: true,
      },
    });

    const docBuffer = await getFileFromS3(template.bucket.key);
    const pdfDoc = await PDFDocument.load(docBuffer);

    const pages = pdfDoc.getPages();

    const pageHeights = pages.map((item) => item.getHeight());

    const pagesRange = pageHeights.reduce<[number, number][]>(
      (prev, curr, index) => {
        const prevRange = prev?.[index - 1]?.[1];
        const startingRange = prevRange ? prevRange : 0;
        const height = curr;

        prev.push([startingRange, height + startingRange]);
        return prev;
      },
      [],
    );

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 8;

    for (const field of template.fields) {
      const value = input?.data?.[field?.name];

      if (value) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const pageNumber: number = field.page;

        const page = pages.at(pageNumber);

        if (!page) {
          throw new Error("page not found");
        }

        const { width: pageWidth, height: pageHeight } = page.getSize();

        const textHeight = font.heightAtSize(fontSize);
        const heightRatio = pageHeight / field.viewportHeight;
        const widthRatio = pageWidth / field.viewportWidth;

        const fieldX = field.left * widthRatio;
        const fieldY = field.top * heightRatio;

        const topMargin = pagesRange?.[pageNumber]?.[0] ?? 0;

        // console.log({
        //   withoutLength: pageHeight - fieldY - textHeight + topMargin,
        //   y: pageHeight - fieldY * pages.length - textHeight + topMargin,
        //   vv: fieldY * pages.length,
        //   length: pages.length,
        //   fieldY,
        // });

        page.drawText(value, {
          x: fieldX,
          y: pageHeight - fieldY * pages.length - textHeight + topMargin,
          font,
          size: fontSize,
        });
      }
    }

    const modifiedPdfBytes = await pdfDoc.save();

    const file = {
      name: `${template.name}`,
      type: "application/pdf",
      arrayBuffer: async () => Promise.resolve(Buffer.from(modifiedPdfBytes)),
      size: 0,
    } as unknown as File;

    const bucketData = await uploadFile(file, {
      identifier: user.companyPublicId,
      keyPrefix: "generic-document",
    });

    const { id: bucketId, name } = await createBucketHandler({
      ctx,
      input: bucketData,
    });

    await createDocumentHandler({
      ctx,
      input: { bucketId, name },
    });

    return {};
  });