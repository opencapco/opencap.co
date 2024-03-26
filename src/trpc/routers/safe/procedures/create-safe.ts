import { withAuth } from "@/trpc/api/trpc";
import { Audit } from "@/server/audit";
import { SafeMutationSchema } from "../schema";
import { generatePublicId } from "@/common/id";
import { uploadFile } from "@/common/uploads";
import path from "path";
import fs from "fs";
import { TRPCError } from "@trpc/server";

export const createSafeProcedure = withAuth
  .input(SafeMutationSchema)
  .mutation(async ({ ctx, input }) => {
    const { userAgent, requestIp } = ctx;
    const user = ctx.session.user;
    const safeTemplate = input.safeTemplate;

    const data = {
      companyId: user.companyId,
      stakeholderId: input.stakeholderId,
      publicId: generatePublicId(),
      capital: input.capital,
      valuationCap: input.valuationCap,
      discountRate: input.discountRate,
      proRata: input.proRata,
      issueDate: new Date(input.issueDate),
      boardApprovalDate: new Date(input.boardApprovalDate),
      safeTemplate,
    };

    try {
      if (safeTemplate !== "CUSTOM") {
        const pdfPath = path.join(
          process.cwd(),
          "public",
          "yc",
          `${safeTemplate}.pdf`,
        );
        const pdfBuffer = fs.readFileSync(pdfPath);

        const { key, mimeType, name, size } = await uploadFile(
          pdfBuffer,
          {
            identifier: "templates",
            keyPrefix: "newsafe",
          },
          "privateBucket",
        );

        const bucketPayload = { key, mimeType, name, size };

        const { document } = await ctx.db.$transaction(async (txn) => {
          const { id, name } = await txn.bucket.create({ data: bucketPayload });

          const newSafe = await txn.safe.create({ data });

          const document = await ctx.db.document.create({
            data: {
              companyId: user.companyId,
              uploaderId: user.memberId,
              publicId: generatePublicId(),
              bucketId: id,
              name: name,
              safeId: newSafe.id,
            },
          });

          await Audit.create(
            {
              action: "safe.created",
              companyId: user.companyId,
              actor: { type: "user", id: ctx.session.user.id },
              context: { requestIp, userAgent },
              target: [{ type: "company", id: user.companyId }],
              summary: `${ctx.session.user.name} created a new SAFE agreement with YC template.`,
            },
            txn,
          );
          return { document };
        });

        return {
          success: true,
          message: "🎉 Successfully created a new SAFE agreement",
          document,
        };
      }

      if (safeTemplate === "CUSTOM") {
        const documents = input.documents;

        if (documents?.length !== 1) return;

        const { document } = await ctx.db.$transaction(async (txn) => {
          const newSafe = await txn.safe.create({ data });

          const document = await txn.document.create({
            data: {
              companyId: user.companyId,
              uploaderId: user.memberId,
              publicId: generatePublicId(),
              bucketId: documents[0]?.bucketId,
              //@ts-expect-error error
              name: documents[0]?.name,
              safeId: newSafe.id,
            },
          });

          await Audit.create(
            {
              action: "safe.created",
              companyId: user.companyId,
              actor: { type: "user", id: ctx.session.user.id },
              context: { requestIp, userAgent },
              target: [{ type: "company", id: user.companyId }],
              summary: `${ctx.session.user.name} created a new SAFE agreement with Custom template.`,
            },
            txn,
          );

          return { document };
        });

        return {
          success: true,
          message: "🎉 Successfully created a new SAFE",
          document,
        };
      }
    } catch (error) {
      console.error("Error creating safe:", error);
      return {
        success: false,
        message: "Oops ! something went out. Please try again later",
      };
    }
  });
