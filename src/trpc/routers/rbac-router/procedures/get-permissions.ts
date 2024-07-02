import { RBAC } from "@/lib/rbac";
import { withAccessControl } from "@/trpc/api/trpc";

export const getPermissionsProcedure = withAccessControl
  .meta({ policies: {} })
  .query(({ ctx: { permissions: perm_ } }) => {
    const permissions = RBAC.normalizePermissionsMap(perm_);

    return { permissions };
  });
