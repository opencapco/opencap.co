import { EsignAudit } from "@/server/audit";
import { checkMembership } from "@/server/auth";
import { withAuth } from "@/trpc/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ZodAddRecipientProcedure } from "../schema";

export const removeRecipientProcedure = withAuth
  .input(
    z.object({
      recipientId: z.string(),
    }),
  )
  .mutation(async ({ ctx: { db, session, requestIp, userAgent }, input }) => {
    console.log({ input }, "remove-recipients");

    const authorName = session.user.name;
    try {
      await db.$transaction(async (tx) => {
        const { companyId } = await checkMembership({
          tx,
          session,
        });

        const recipient = await db.esignRecipient.delete({
          where: {
            id: input.recipientId,
          },
          select: {
            id: true,
            name: true,
            template: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        await EsignAudit.create(
          {
            action: "recipient.removed",
            companyId,
            recipientId: recipient.id,
            templateId: recipient.template.id,
            ip: requestIp,
            location: "",
            userAgent,
            summary: `${authorName} removed ${recipient.name} as an e-sign recipient for template : ${recipient.template.name} `,
          },
          tx,
        );
      });
      return {
        success: true,
        message: "Recipient successfully deleted",
      };
    } catch (error) {
      console.error({ error });
      return {
        success: false,
        message: "Something went wrong. Please try again later",
      };
    }
  });

export const toggleOrderedDeliveryProcedure = withAuth
  .input(z.object({ templateId: z.string(), orderedDelivery: z.boolean() }))
  .mutation(async ({ ctx: { session, db }, input }) => {
    try {
      const { updatedStatus } = await db.$transaction(async (tx) => {
        const { companyId } = await checkMembership({
          tx,
          session,
        });

        const template = await tx.template.findFirstOrThrow({
          where: {
            id: input.templateId,
            companyId,
          },
          select: {
            orderedDelivery: true,
          },
        });
        if (input.orderedDelivery === template.orderedDelivery) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Template already has a ${template.orderedDelivery} flag as ordered delivery.`,
          });
        }
        const updated = await tx.template.update({
          where: {
            id: input.templateId,
          },
          data: {
            orderedDelivery: !template.orderedDelivery,
          },
        });
        return {
          updatedStatus: updated.orderedDelivery,
        };
      });

      return {
        success: true,
        message: updatedStatus
          ? "Successfully enabled the ordered delivery"
          : "Successfully disabled the ordered delivery",
      };
    } catch (error) {
      console.error(error);
      if (error instanceof TRPCError) {
        return {
          success: false,
          message: error.message,
        };
      }
      return {
        success: false,
        message: "Something went out. Please try again later.",
      };
    }
  });

export const addRecipientProcedure = withAuth
  .input(ZodAddRecipientProcedure)
  .mutation(async ({ ctx, input }) => {
    try {
      console.log({ input }, "add-recipients");

      const authorName = ctx.session.user.name;

      if (!input.recipient.email) {
        return {
          success: false,
          message: "Email must be present for adding recipients.",
        };
      }

      const recipientId = await ctx.db.$transaction(async (tx) => {
        const { companyId } = await checkMembership({
          tx,
          session: ctx.session,
        });

        const recipient = await tx.esignRecipient.create({
          data: { ...input.recipient, templateId: input.templateId },
          select: {
            id: true,
            name: true,
            template: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
        EsignAudit.create(
          {
            action: "recipient.added",
            companyId,
            recipientId: recipient.id,
            templateId: recipient.template.id,
            ip: ctx.requestIp,
            location: "",
            userAgent: ctx.userAgent,
            summary: `${authorName} added ${recipient.name} as an e-sign recipient for template : ${recipient.template.name}`,
          },
          tx,
        );
        return recipient.id;
      });

      return {
        success: true,
        recipientId,
        message: "Recipient successfully added",
      };
    } catch (error) {
      console.error({ error });
      return {
        success: false,
        message: "Something went out. Please try again later.",
      };
    }
  });
