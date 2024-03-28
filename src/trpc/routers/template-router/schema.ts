import { z } from "zod";

export const ZodCreateTemplateMutationSchema = z.object({
  name: z.string(),
  bucketId: z.string(),
});

export const ZodGetTemplateQuerySchema = z.object({
  publicId: z.string(),
});

export const ZodSignTemplateMutationSchema = z.object({
  templateId: z.string(),
  data: z.record(z.string()),
  recipientId: z.string(),
  group: z.string(),
});

export const ZodGetSigningFieldsSchema = z.object({
  token: z.string(),
});
