import { generateInviteToken, generateMemberIdentifier } from "@/server/member";
import type { PrismaClient } from "@prisma/client";

export type PrismaTransactionalClient = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

type MemberPayload = {
  userId: string;
  name: string;
  title: string;
  email: string;
  companyId: string;
};

export async function createTeamMember(
  tx: PrismaTransactionalClient,
  memberPayload: MemberPayload,
) {
  const { userId, companyId, email, title } = memberPayload;
  //  create member
  const member = await tx.member.upsert({
    create: {
      title,
      isOnboarded: false,
      lastAccessed: new Date(),
      companyId,
      userId,
      status: "PENDING",
    },
    update: {
      title,
      isOnboarded: false,
      lastAccessed: new Date(),
      status: "PENDING",
    },
    where: {
      companyId_userId: {
        companyId,
        userId,
      },
    },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  const { expires, memberInviteTokenHash } = await generateInviteToken();

  // custom verification token for member invitation
  const { token: verificationToken } = await tx.verificationToken.create({
    data: {
      identifier: generateMemberIdentifier({
        email,
        memberId: member.id,
      }),
      token: memberInviteTokenHash,
      expires,
    },
  });

  return {
    verificationToken,
    member,
  };
}
