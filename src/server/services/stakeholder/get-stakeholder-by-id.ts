import type { PrismaClient } from "@prisma/client";

export type PrismaTransactionalClient = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

type GetStakeholderById = {
  db: PrismaTransactionalClient;
  stakeholderId: string;
};

export const getStakeholderById = async ({
  db,
  stakeholderId,
}: GetStakeholderById) => {
  return await db.stakeholder.findUniqueOrThrow({
    where: {
      id: stakeholderId,
    },
    include: {
      company: {
        select: {
          name: true,
        },
      },
    },
  });
};
