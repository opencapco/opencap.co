import { ACTIONS, SUBJECTS } from "@/constants/rbac";
import { z } from "zod";

export const ZodCreateRoleMutationSchema = z.object({
  name: z.string().min(1),
  permissions: z.record(
    z.enum(SUBJECTS),
    z.record(z.enum(ACTIONS), z.boolean()),
  ),
});

export type TypeZodCreateRoleMutationSchema = z.infer<
  typeof ZodCreateRoleMutationSchema
>;
