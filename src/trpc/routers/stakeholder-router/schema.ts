import {
  StakeholderRelationshipEnum,
  StakeholderTypeEnum,
} from "@/prisma/enums";
import { z } from "zod";

export const ZodAddStakeholderMutationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email().min(1),
  institutionName: z.string().min(1).optional(),
  stakeholderType: z.nativeEnum(StakeholderTypeEnum, {
    errorMap: () => ({ message: "Invalid value for stakeholderType" }),
  }),
  currentRelationship: z.nativeEnum(StakeholderRelationshipEnum, {
    errorMap: () => ({ message: "Invalid value for currentRelationship" }),
  }),
  taxId: z.string().min(1).optional(),
  streetAddress: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  zipcode: z.string().min(1).optional(),
});

export const ZodAddStakeholderArrayMutationSchema = z.array(
  ZodAddStakeholderMutationSchema,
);

export type TypeStakeholderArray = z.infer<
  typeof ZodAddStakeholderArrayMutationSchema
>;

export type AddStakeholderMutationType = z.infer<
  typeof ZodAddStakeholderMutationSchema
>;

export const ZodUpdateStakeholderMutationSchema =
  ZodAddStakeholderMutationSchema.partial();
