import { createTRPCRouter } from "@/trpc/api/trpc";
import { createTemplateProcedure } from "./procedures/create-template";
import { getTemplateProcedure } from "./procedures/get-template";
import { signTemplateProcedure } from "./procedures/sign-template";
import { getSigningFieldsProcedure } from "./procedures/get-signing-fields";

export const templateRouter = createTRPCRouter({
  create: createTemplateProcedure,
  get: getTemplateProcedure,
  sign: signTemplateProcedure,
  getSigningFields: getSigningFieldsProcedure,
});
