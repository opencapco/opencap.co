import { withAuth } from "@/trpc/api/trpc";

export const getSharesProcedure = withAuth.query(async ({ ctx, input }) => {
  const user = ctx.session.user;

  const data = await ctx.db.share.findMany({
    where: {
      companyId: user.companyId,
    },
    select: {
      id: true,
      certificateId: true,
      quantity: true,
      pricePerShare: true,
      status: true,
      vestingSchedule: true,
      issueDate: true,
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
