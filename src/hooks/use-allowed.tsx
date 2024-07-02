import type { TActions, TSubjects } from "@/constants/rbac";
import { api } from "@/trpc/react";

export interface useAllowedOptions {
  subject: TSubjects;
  action: TActions;
}

export function useAllowed({ action, subject }: useAllowedOptions) {
  const { data } = api.rbac.getPermissions.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const permissions = data?.permissions ?? new Map<TSubjects, TActions[]>();

  const hasSubject = permissions.has(subject);
  const hasAction =
    (permissions.get(subject)?.includes(action) ?? false) ||
    (permissions.get(subject)?.includes("*") ?? false);

  const isAllowed = hasSubject && hasAction;

  return { isAllowed };
}
