import { createTRPCRouter } from "@/trpc/api/trpc";
import { createTemplateProcedure } from "./procedures/create-template";
import { getAllTemplateProcedure } from "./procedures/get-all-template";
import { getEsignRecipientsProcedure } from "./procedures/get-esign-recipients";
import { getSigningFieldsProcedure } from "./procedures/get-signing-fields";
import { getTemplateProcedure } from "./procedures/get-template";
import {
  addRecipientProcedure,
  removeRecipientProcedure,
  toggleOrderedDeliveryProcedure,
} from "./procedures/manage-recipients";
import { signTemplateProcedure } from "./procedures/sign-template";

export const templateRouter = createTRPCRouter({
  create: createTemplateProcedure,
  get: getTemplateProcedure,
  sign: signTemplateProcedure,
  getSigningFields: getSigningFieldsProcedure,
  all: getAllTemplateProcedure,
  addRecipient: addRecipientProcedure,
  removeRecipient: removeRecipientProcedure,
  toggleOrderedDelivery: toggleOrderedDeliveryProcedure,
  getRecipients: getEsignRecipientsProcedure,
});
