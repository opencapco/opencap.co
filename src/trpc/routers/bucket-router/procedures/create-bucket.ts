import { Audit } from "@/server/audit";
import { TPrismaOrTransaction } from "@/server/db";
import { withAuth } from "@/trpc/api/trpc";
import {
  type TypeZodCreateBucketMutationSchema,
  ZodCreateBucketMutationSchema,
} from "../schema";

interface createBucketHandlerOptions {
  input: TypeZodCreateBucketMutationSchema;
  db: TPrismaOrTransaction;
}

export const createBucketHandler = ({
  db,
  input,
}: createBucketHandlerOptions) => {
  return db.bucket.create({ data: input });
};

export const createBucketProcedure = withAuth
  .input(ZodCreateBucketMutationSchema)
  .mutation(async ({ ctx: { db, session, requestIp, userAgent }, input }) => {
    const { bucket } = await db.$transaction(async (tx) => {
      const bucket = await createBucketHandler({ input, db: tx });
      await Audit.create(
        {
          action: "bucket.created",
          companyId: session.user.companyId,
          actor: { type: "user", id: session.user.id },
          context: {
            requestIp,
            userAgent,
          },
          target: [{ type: "bucket", id: bucket.id }],
          summary: `${session.user.name} created a new s3 bucket.`,
        },
        tx,
      );
      return { bucket };
    });
    return bucket;
  });
