import { type withAuthTrpcContextType, withAuth } from "@/trpc/api/trpc";
import { Audit } from "@/server/audit";
import { type Prisma } from "@prisma/client";
import {
  type TypeZodDeleteSafesMutationSchema,
  ZodDeleteSafesMutationSchema,
} from "../schema";

export const deleteSafeProcedure = withAuth
  .input(ZodDeleteSafesMutationSchema)
  .mutation(async (args) => {
    return await deleteSafeHandler(args);
  });

interface deleteSafeHandlerOptions {
  input: TypeZodDeleteSafesMutationSchema;
  ctx: withAuthTrpcContextType;
}

export async function deleteSafeHandler({
  ctx: { db, session, requestIp, userAgent },
  input,
}: deleteSafeHandlerOptions) {
  const user = session.user;
  const { safeId } = input;
  try {
    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const safe = await tx.safe.delete({
        where: {
          id: safeId,
          companyId: session.user.companyId,
        },
        select: {
          id: true,
          stakeholder: {
            select: {
              id: true,
              name: true,
            },
          },
          company: {
            select: {
              name: true,
            },
          },
        },
      });

      await Audit.create(
        {
          action: "safe.deleted",
          companyId: user.companyId,
          actor: { type: "user", id: session.user.id },
          context: {
            requestIp,
            userAgent,
          },
          target: [{ type: "company", id: user.companyId }],
          summary: `${user.name} deleted safe agreement of stakholder ${safe.stakeholder.name}`,
        },
        tx,
      );
    });

    return { success: true };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: "Oops, something went wrong while deleting option.",
    };
  }
}
