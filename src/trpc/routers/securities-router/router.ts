import { createTRPCRouter } from "@/trpc/api/trpc";
import { addOptionProcedure } from "./procedures/add-option";
import { getOptionsProcedure } from "./procedures/get-options";
import { deleteOptionProcedure } from "./procedures/delete-option";
import { addShareProcedure } from "./procedures/add-share";
import { getSharesProcedure } from "./procedures/get-shares";

export const securitiesRouter = createTRPCRouter({
  getOptions: getOptionsProcedure,
  addOptions: addOptionProcedure,
  deleteOption: deleteOptionProcedure,

  addShares: addShareProcedure,
  getShares: getSharesProcedure,
});
