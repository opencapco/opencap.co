import type { TActions, TSubjects } from "@/constants/rbac";
import type { TPermission } from "@/lib/rbac/schema";
import { withAccessControl } from "@/trpc/api/trpc";
import { ZodCreateRoleMutationSchema } from "../schema";

export const createRolesProcedure = withAccessControl
  .input(ZodCreateRoleMutationSchema)
  .meta({
    policies: {
      roles: { allow: ["create"] },
    },
  })
  .mutation(async ({ input, ctx: { db, membership } }) => {
    const permissions: TPermission[] = [];

    for (const subject of Object.keys(input.permissions)) {
      const policy = input.permissions[subject as TSubjects];
      const data: TPermission = { actions: [], subject: subject as TSubjects };

      if (policy) {
        if (policy["*"]) {
          data.actions.push("*");
        }

        for (const action of Object.keys(policy)) {
          if (policy[action as TActions] && action !== "*") {
            data.actions.push(action as TActions);
          }
        }

        permissions.push(data);
      }
    }

    await db.role.create({
      data: {
        companyId: membership.companyId,
        name: input.name,
        permissions,
      },
    });

    return { message: "role created successfully" };
  });
