import { SafeTypeEnum, SafeStatusEnum, SafeTemplateEnum } from "@/prisma-enums";
import { z } from "zod";

export const SafeMutationSchema = z.object({
  id: z.string().optional(),
  publicId: z.string().optional(),
  type: z
    .nativeEnum(SafeTypeEnum, {
      errorMap: () => ({ message: "Invalid SAFE type" }),
    })
    .optional(),
  status: z
    .nativeEnum(SafeStatusEnum, {
      errorMap: () => ({ message: "Invalid SAFE status" }),
    })
    .optional(),
  capital: z.number(),
  valuationCap: z.number(),
  discountRate: z.number(),
  mfn: z.boolean().optional(),
  proRata: z.boolean(),
  additionalTerms: z.string().optional(),

  stakeholderId: z.string(),

  investorName: z.string(),
  investorEmail: z.string().email(),
  investorInstitutionName: z.string().optional(),

  issueDate: z.coerce.date({
    required_error: "Issue date is required",
    invalid_type_error: "This is not a valid date",
  }),
  boardApprovalDate: z.coerce.date({
    required_error: "Board approval date is required",
    invalid_type_error: "This is not a valid date",
  }),
  safeTemplate: z.nativeEnum(SafeTemplateEnum, {
    errorMap: () => ({ message: "Invalid SAFE template" }),
  }),
  documents: z
    .array(
      z.object({
        bucketId: z.string(),
        name: z.string(),
      }),
    )
    .optional(),
});

export type SafeMutationType = z.infer<typeof SafeMutationSchema>;

export const ZodDeleteSafesMutationSchema = z.object({
  safeId: z.string(),
});

export type TypeZodDeleteSafesMutationSchema = z.infer<
  typeof ZodDeleteSafesMutationSchema
>;
