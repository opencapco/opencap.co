import { withAccessControl } from "@/trpc/api/trpc";
import { ZodAddStakeholderArrayMutationSchema } from "../schema";

export const addStakeholdersProcedure = withAccessControl
  .input(ZodAddStakeholderArrayMutationSchema)
  .meta({ policies: { stakeholder: { allow: ["create"] } } })
  .mutation(async ({ ctx: { db, membership }, input }) => {
    try {
      await db.$transaction(async (tx) => {
        // insert companyId in every input
        const inputDataWithCompanyId = input.map((stakeholder) => ({
          ...stakeholder,
          companyId: membership.companyId,
        }));

        await tx.stakeholder.createMany({
          data: inputDataWithCompanyId,
          skipDuplicates: true,
        });
      });

      return {
        success: true,
        message: "Stakeholders added successfully!",
      };
    } catch (_error) {
      return {
        success: false,
        message: "Oops, something went wrong. Please try again later.",
      };
    }
  });
