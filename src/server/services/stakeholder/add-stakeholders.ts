import { Audit } from "@/server/audit";
import type { TypeStakeholderArray } from "@/trpc/routers/stakeholder-router/schema";
import type { PrismaClient } from "@prisma/client";

type AddStakeholderOptions = {
  db: PrismaClient;
  payload: {
    companyId: string;
    requestIp: string;
    userAgent: string;
    user: {
      id: string;
      name: string;
    };
    data: TypeStakeholderArray;
  };
};

export const addStakeholders = async ({
  db,
  payload,
}: AddStakeholderOptions) => {
  const { companyId, requestIp, userAgent, user, data } = payload;

  await db.$transaction(async (tx) => {
    const inputDataWithCompanyId = data.map((stakeholder) => ({
      ...stakeholder,
      companyId,
    }));

    const addedStakeholders = await tx.stakeholder.createManyAndReturn({
      data: inputDataWithCompanyId,
      skipDuplicates: true,
      select: {
        id: true,
        name: true,
      },
    });

    const auditPromises = addedStakeholders.map((stakeholder) =>
      Audit.create(
        {
          action: "stakeholder.added",
          companyId: companyId,
          actor: { type: "user", id: user.id },
          context: {
            requestIp,
            userAgent,
          },
          target: [{ type: "stakeholder", id: stakeholder.id }],
          summary: `${user.name} deleted the stakholder from the company : ${stakeholder.name}`,
        },
        tx,
      ),
    );

    await Promise.all(auditPromises);
  });
  return {};
};
