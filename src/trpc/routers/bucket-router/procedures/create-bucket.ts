import { withAuth, type CreateTRPCContextType } from "@/trpc/api/trpc";
import {
  type TypeZodCreateBucketMutationSchema,
  ZodCreateBucketMutationSchema,
} from "../schema";

interface createBucketHandlerOptions extends Pick<CreateTRPCContextType, "db"> {
  input: TypeZodCreateBucketMutationSchema;
}

export const createBucketHandler = ({
  db,
  input,
}: createBucketHandlerOptions) => {
  return db.bucket.create({ data: input });
};

export const createBucketProcedure = withAuth
  .input(ZodCreateBucketMutationSchema)
  .mutation(async ({ ctx: { db }, input }) => {
    return createBucketHandler({ input, db });
  });
