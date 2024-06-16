import { checkMembership } from "@/server/auth";
import { withAuth } from "@/trpc/api/trpc";
import { z } from "zod";

export const getEsignRecipientsProcedure = withAuth
  .input(z.object({ templateId: z.string() }))
  .query(async ({ ctx: { db }, input }) => {
    const recipients = await db.esignRecipient.findMany({
      where: {
        templateId: input.templateId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        template: {
          select: {
            orderedDelivery: true,
          },
        },
      },
    });

    const payload = {
      recipients: recipients.map((recp) => ({
        id: recp.id,
        name: recp.name,
        email: recp.email,
      })),
      orderedDelivery: recipients[0]?.template.orderedDelivery,
    };

    return payload;
  });
