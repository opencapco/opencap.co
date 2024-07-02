import { defaultPermissions } from "@/constants/rbac";
import type { Roles } from "@/prisma/enums";
import { checkMembership } from "@/server/auth";
import type { TPrismaOrTransaction } from "@/server/db";
import type { Session } from "next-auth";
import { wrap } from "../error";
import { BaseError } from "../error/errors/base";

export interface checkMembershipOptions {
  session: Session;
  tx: TPrismaOrTransaction;
}

class MembershipNotFoundError extends BaseError {
  public readonly name = "MembershipNotFoundError";
  public readonly retry = false;
}

export async function checkAccessControlMembership({
  session,
  tx,
}: checkMembershipOptions) {
  return wrap(
    checkMembership({ session, tx }),
    (err) => new MembershipNotFoundError({ message: err.message }),
  );
}

export function getPermissions(role: Roles) {
  if (role !== "CUSTOM") {
    return defaultPermissions[role];
  }
  return defaultPermissions.SUPER_USER;
}
