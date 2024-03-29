import { withAuth } from "@/trpc/api/trpc";
import { ZodUpdateMemberMutationSchema } from "../schema";
import { Audit } from "@/server/audit";

export const updateMemberProcedure = withAuth
  .input(ZodUpdateMemberMutationSchema)
  .mutation(async ({ ctx: { session, db, requestIp, userAgent }, input }) => {
    const { memberId, name, ...rest } = input;
    const user = session.user;

    await db.$transaction(async (tx) => {
      const member = await tx.member.update({
        where: {
          status: "ACTIVE",
          id: memberId,
          companyId: session.user.companyId,
        },
        data: {
          ...rest,
          user: {
            update: {
              name,
            },
          },
        },
        select: {
          userId: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      await Audit.create(
        {
          action: "member.updated",
          companyId: user.companyId,
          actor: { type: "user", id: user.id },
          context: {
            requestIp,
            userAgent,
          },
          target: [{ type: "user", id: member.userId }],
          summary: `${user.name} updated ${member.user?.name} details`,
        },
        tx,
      );
    });

    return { success: true };
  });
