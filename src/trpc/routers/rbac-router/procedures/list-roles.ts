import { withAccessControl } from "@/trpc/api/trpc";

import { permissionSchema } from "@/lib/rbac/schema";
import type { Roles } from "@/prisma/enums";

const humanizedDefaultRoles: Record<Exclude<Roles, "CUSTOM">, string> = {
  BILLING: "Billing",
  EMPLOYEE: "Employee",
  INVESTOR: "Investor",
  SUPER_USER: "Super User",
};

const defaultRoleNames = Object.values(humanizedDefaultRoles);
const defaultRolesList: RoleList[] = defaultRoleNames.map((name) => ({
  name,
  type: "default",
  id: `default-${name}`,
}));

type RoleList = {
  id: string;
  type: "default" | "custom";
  name: string;
};

export const listRolesProcedure = withAccessControl
  .meta({
    policies: {
      roles: { allow: ["read"] },
    },
  })
  .query(async ({ ctx }) => {
    const customRoles = await ctx.db.role.findMany({
      where: {
        companyId: ctx.membership.companyId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    const customRolesList: RoleList[] = customRoles.map((data) => ({
      ...data,
      type: "custom",
    }));

    return { rolesList: defaultRolesList.concat(customRolesList) };
  });
