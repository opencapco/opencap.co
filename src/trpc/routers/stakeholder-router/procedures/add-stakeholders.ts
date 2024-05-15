import { Audit } from "@/server/audit";
import { checkMembership } from "@/server/auth";
import { withAuth } from "@/trpc/api/trpc";
import { ZodAddStakeholderArrayMutationSchema } from "../schema";

export const addStakeholdersProcedure = withAuth
  .input(ZodAddStakeholderArrayMutationSchema)
  .mutation(async ({ ctx: { db, session, requestIp, userAgent }, input }) => {
    const user = session.user;
    try {
      await db.$transaction(async (tx) => {
        const { companyId } = await checkMembership({ session, tx });

        const inputDataWithCompanyId = input.map((stakeholder) => ({
          ...stakeholder,
          companyId,
        }));

        await tx.stakeholder.createMany({
          data: inputDataWithCompanyId,
          skipDuplicates: true,
        });

        await Audit.create(
          {
            action: "stakeholder.added",
            companyId: user.companyId,
            actor: { type: "user", id: user.id },
            context: {
              requestIp,
              userAgent,
            },
            target: [{ type: "company", id: user.companyId }],
            summary: `${user.name} added stakeholder(s) in company.`,
          },
          tx,
        );
      });

      return {
        success: true,
        message: "Stakeholders added successfully!",
      };
    } catch (error) {
      console.error("Error adding stakeholders:", error);
      return {
        success: false,
        message: "Oops, something went wrong. Please try again later.",
      };
    }
  });
