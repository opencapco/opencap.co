import { generatePublicId } from "@/common/id";
import { Audit } from "@/server/audit";
import { withAuth } from "@/trpc/api/trpc";
import { UpdateMutationSchema } from "../schema";

export const saveUpdateProcedure = withAuth
  .input(UpdateMutationSchema)
  .mutation(async ({ ctx: { session, userAgent, requestIp, db }, input }) => {
    try {
      const user = session.user;
      const authorId = user.memberId;
      const companyId = user.companyId;
      const publicId = input.publicId ?? generatePublicId();
      const { title, content, html } = input;

      if (title.length === 0 || content.length === 0) {
        return {
          success: false,
          message: "Title and content cannot be empty.",
        };
      } else {
        await db.$transaction(async (tx) => {
          if (input.publicId) {
            await tx.update.update({
              where: { publicId },
              data: {
                html,
                title,
                content,
              },
            });
          } else {
            const update = await tx.update.create({
              data: {
                html,
                title,
                content,
                publicId,
                companyId,
                authorId,
              },
            });

            await Audit.create(
              {
                action: "update.saved",
                companyId: user.companyId,
                actor: { type: "user", id: user.id },
                context: {
                  requestIp,
                  userAgent,
                },
                target: [{ type: "update", id: update.id }],
                summary: `${user.name} saved the (${update.title}) update.`,
              },
              tx,
            );
          }
        });

        return {
          publicId,
          success: true,
          message: "Successfully saved an update.",
        };
      }
    } catch (error) {
      console.error("Error saving an update:", error);
      return {
        success: false,
        message: "Oops, something went wrong. Please try again later.",
      };
    }
  });
