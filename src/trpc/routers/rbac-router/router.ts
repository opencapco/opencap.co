import { createTRPCRouter } from "@/trpc/api/trpc";
import { createRolesProcedure } from "./procedures/create-role";
import { getPermissionsProcedure } from "./procedures/get-permissions";
import { listRolesProcedure } from "./procedures/list-roles";

export const rbacRouter = createTRPCRouter({
  getPermissions: getPermissionsProcedure,
  listRoles: listRolesProcedure,
  createRole: createRolesProcedure,
});
