import { Audit } from "@/server/audit";
import type { PrismaClient } from "@prisma/client";

export type PrismaTransactionalClient = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

type DeleteStakeholderOption = {
  db: PrismaClient;
  payload: {
    companyId: string;
    stakeholderId: string;
    requestIp: string;
    userAgent: string;
    user: {
      id: string;
      name: string;
    };
  };
};

export const deleteStakeholder = async ({
  db,
  payload,
}: DeleteStakeholderOption) => {
  const { companyId, stakeholderId, requestIp, userAgent, user } = payload;

  const { deletedStakeholder } = await db.$transaction(async (tx) => {
    const deletedStakeholder = await tx.stakeholder.delete({
      where: {
        id: stakeholderId,
        companyId,
      },
    });
    await Audit.create(
      {
        action: "stakeholder.deleted",
        companyId: payload.companyId,
        actor: { type: "user", id: payload.user.id },
        context: {
          requestIp,
          userAgent,
        },
        target: [{ type: "stakeholder", id: deletedStakeholder.id }],
        summary: `${user.name} deleted the stakholder from the company : ${deletedStakeholder.name}`,
      },
      tx,
    );
    return { deletedStakeholder };
  });
  return deletedStakeholder;
};
