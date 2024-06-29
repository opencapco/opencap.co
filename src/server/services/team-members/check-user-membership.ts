import type { PrismaClient } from "@prisma/client";

export type PrismaTransactionalClient = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

type UserPayload = {
  name: string;
  email: string;
  companyId: string;
};

export async function checkUserMembershipForInvitation(
  tx: PrismaTransactionalClient,
  user: UserPayload,
) {
  const { name, email, companyId } = user;

  // create or find user
  const invitedUser = await tx.user.upsert({
    where: {
      email,
    },
    update: {},
    create: {
      name,
      email,
    },
    select: {
      id: true,
    },
  });

  // check if user is already a member
  const prevMember = await tx.member.findUnique({
    where: {
      companyId_userId: {
        companyId,
        userId: invitedUser.id,
      },
    },
  });

  if (prevMember && prevMember.status === "ACTIVE") {
    return false;
  }

  return invitedUser;
}
