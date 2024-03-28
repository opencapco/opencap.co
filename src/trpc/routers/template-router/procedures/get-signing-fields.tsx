import { publicProcedure } from "@/trpc/api/trpc";
import { ZodGetSigningFieldsSchema } from "../schema";
import { getPresignedGetUrl } from "@/server/file-uploads";
import { DecodeEmailToken } from "../../template-field-router/procedures/add-fields";

export const getSigningFieldsProcedure = publicProcedure
  .input(ZodGetSigningFieldsSchema)
  .query(async ({ ctx, input }) => {
    const {
      group,
      id: templateId,
      rec: recipientId,
    } = await DecodeEmailToken(input.token);

    const { bucket, fields } = await ctx.db.$transaction(async (tx) => {
      const recipient = await tx.esignRecipient.findFirstOrThrow({
        where: {
          id: recipientId,
          templateId,
          group,
          status: "PENDING",
        },
        select: {
          templateId: true,
        },
      });

      const { bucket } = await tx.template.findFirstOrThrow({
        where: {
          id: recipient.templateId,
        },
        select: {
          bucket: {
            select: {
              key: true,
            },
          },
        },
      });

      const fields = await tx.templateField.findMany({
        where: {
          group,
          templateId: recipient.templateId,
        },
        select: {
          id: true,
          name: true,
          width: true,
          height: true,
          top: true,
          left: true,
          required: true,
          defaultValue: true,
          readOnly: true,
          type: true,
          viewportHeight: true,
          viewportWidth: true,
          page: true,
          group: true,
        },
        orderBy: {
          top: "asc",
        },
      });

      return { bucket, fields };
    });

    const { key, url } = await getPresignedGetUrl(bucket.key);

    return {
      fields,
      key,
      url,
      recipientId,
      group,
      templateId,
    };
  });
