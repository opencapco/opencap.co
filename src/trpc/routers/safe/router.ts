import { createTRPCRouter } from "@/trpc/api/trpc";
import { createSafeProcedure } from "./procedures/create-safe";
import { getSafesProcedure } from "./procedures/get-safes";
import { deleteSafeProcedure } from "./procedures/delete-safe";

export const safeRouter = createTRPCRouter({
  getSafes: getSafesProcedure,
  create: createSafeProcedure,
  deleteSafe: deleteSafeProcedure,
});

//   // import: withAuth
//   //   .input(SafeMutationSchema)
//   //   .mutation(async ({ ctx, input }) => {
//   //     try {
//   //       try {
//   //         const { userAgent, requestIp } = ctx;
//   //         const companyId = ctx.session.user.companyId;

//   //         await ctx.db.$transaction(async (tx) => {
//   //           const data = {};

//   //           await tx.safe.create({ data });
//   //           await Audit.create(
//   //             {
//   //               action: "safe.imported",
//   //               companyId,
//   //               actor: { type: "user", id: ctx.session.user.id },
//   //               context: {
//   //                 requestIp,
//   //                 userAgent,
//   //               },
//   //               target: [{ type: "company", id: companyId }],
//   //               summary: `${ctx.session.user.name} imported an existing SAFE agreement.`,
//   //             },
//   //             tx,
//   //           );
//   //         });

//   //         return { success: true, message: "Successfully imported an existing SAFE agreement." };
//   //     } catch (error) {
//   //       console.error("Error importing an existing SAFE.", error);
//   //       return {
//   //         success: false,
//   //         message: "Oops, something went wrong. Please try again later.",
//   //       };
//   //     }
//   //   }),
// });
