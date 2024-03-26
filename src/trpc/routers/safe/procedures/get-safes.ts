import { withAuth } from "@/trpc/api/trpc";

export const getSafesProcedure = withAuth.query(async ({ ctx }) => {
  const user = ctx.session.user;

  const data = await ctx.db.safe.findMany({
    where: {
      companyId: user.companyId,
    },
    select: {
      id: true,
      publicId: true,
      type: true,
      status: true,
      capital: true,
      safeTemplate: true,
      valuationCap: true,
      discountRate: true,
      mfn: true,
      proRata: true,
      additionalTerms: true,
      issueDate: true,
      boardApprovalDate: true,
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
