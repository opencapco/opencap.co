import { createTRPCRouter } from "@/trpc/api/trpc";

import { addStakeholdersProcedure } from "./procedures/add-stakeholders";
import { getStakeholdersProcedure } from "./procedures/get-stakeholders";
import { updateStakeholderProcedure } from "./procedures/update-stakeholder";

export const stakeholderRouter = createTRPCRouter({
  addStakeholders: addStakeholdersProcedure,
  getStakeholders: getStakeholdersProcedure,
  updateStakeholder: updateStakeholderProcedure,
});
