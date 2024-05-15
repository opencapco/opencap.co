import { generatePublicId } from "@/common/id";
import { Audit } from "@/server/audit";
import { withAuth } from "@/trpc/api/trpc";
import { UpdateMutationSchema } from "../schema";

export const cloneUpdateProcedure = withAuth
  .input(UpdateMutationSchema)
  .mutation(async ({ ctx: { db, userAgent, requestIp, session }, input }) => {
    try {
      const user = session.user;
      const authorId = user.memberId;
      const companyId = user.companyId;
      const publicId = generatePublicId();
      const { title, content, html } = input;

      if (title.length === 0 || content.length === 0) {
        return {
          success: false,
          message: "Title and content cannot be empty.",
        };
      } else {
        await db.$transaction(async (tx) => {
          const update = await tx.update.create({
            data: {
              html,
              title: `Copy of - ${title}`,
              content,
              publicId,
              companyId,
              authorId,
            },
          });

          await Audit.create(
            {
              action: "update.cloned",
              companyId: user.companyId,
              actor: { type: "user", id: user.id },
              context: {
                requestIp,
                userAgent,
              },
              target: [{ type: "update", id: update.id }],
              summary: `${user.name} cloned the (${update.title}) update.`,
            },
            tx,
          );
        });

        return {
          publicId,
          success: true,
          message: "Successfully cloned an update.",
        };
      }
    } catch (error) {
      console.error("Error cloning an update:", error);
      return {
        success: false,
        message: "Oops, something went wrong. Please try again later.",
      };
    }
  });
