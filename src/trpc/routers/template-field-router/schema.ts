import { z } from "zod";

import { FieldTypes } from "@/prisma-enums";

export const ZodAddFieldMutationSchema = z.object({
  templatePublicId: z.string(),
  fields: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      width: z.number(),
      height: z.number(),
      top: z.number(),
      left: z.number(),
      required: z.boolean(),
      type: z.nativeEnum(FieldTypes),
      viewportHeight: z.number(),
      viewportWidth: z.number(),
      page: z.number(),
      defaultValue: z.string(),
      readOnly: z.boolean(),
      group: z.string(),
    }),
  ),
  recipients: z.array(
    z.object({
      name: z.string(),
      email: z.string().email(),
      group: z.string(),
    }),
  ),
  orderedDelivery: z.boolean(),
});

export type TypeZodAddFieldMutationSchema = z.infer<
  typeof ZodAddFieldMutationSchema
>;
