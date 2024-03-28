import { withAuth } from "@/trpc/api/trpc";

export const getOptionsProcedure = withAuth.query(async ({ ctx }) => {
  const user = ctx.session.user;

  const data = await ctx.db.option.findMany({
    where: {
      companyId: user.companyId,
    },
    select: {
      id: true,
      grantId: true,
      quantity: true,
      exercisePrice: true,
      type: true,
      status: true,
      vestingSchedule: true,
      issueDate: true,
      expirationDate: true,
      vestingStartDate: true,
      boardApprovalDate: true,
      rule144Date: true,
      stakeholder: {
        select: {
          name: true,
        },
      },
      documents: {
        select: {
          id: true,
          name: true,
          uploader: {
            select: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
          bucket: {
            select: {
              key: true,
              mimeType: true,
              size: true,
            },
          },
        },
      },
    },
  });

  return { data };
});
