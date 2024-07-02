import type { TPermission } from "@/lib/rbac/schema";
import type { Roles } from "@/prisma/enums";

type DefaultRoles = Exclude<Roles, "CUSTOM">;

export const ACTIONS = ["create", "read", "update", "delete", "*"] as const;
export const SUBJECTS = ["billing", "invite", "stakeholder", "roles"] as const;

export type TSubjects = (typeof SUBJECTS)[number];
export type TActions = (typeof ACTIONS)[number];

const SUPER_USER = SUBJECTS.map((item) => ({
  actions: ["*" as TActions],
  subject: item,
}));

export const defaultPermissions: Record<DefaultRoles, TPermission[]> = {
  BILLING: [{ actions: ["*"], subject: "billing" }],
  EMPLOYEE: [{ actions: ["*"], subject: "invite" }],
  INVESTOR: [],
  SUPER_USER,
};
