import { withAuth, type withAuthTrpcContextType } from "@/trpc/api/trpc";
import {
  type TypeZodCreateDocumentMutationSchema,
  ZodCreateDocumentMutationSchema,
} from "../schema";
import { generatePublicId } from "@/common/id";
import { Audit } from "@/server/audit";

interface createDocumentHandlerOptions
  extends Pick<withAuthTrpcContextType, "requestIp" | "userAgent" | "db"> {
  input: TypeZodCreateDocumentMutationSchema;
  companyId: string;
  uploaderName?: string | null | undefined;
  uploaderId?: string;
}

export const createDocumentHandler = async ({
  db,
  requestIp,
  userAgent,
  input,
  companyId,
  uploaderName,
  uploaderId,
}: createDocumentHandlerOptions) => {
  const publicId = generatePublicId();

  const { document } = await db.$transaction(async (tx) => {
    const document = await tx.document.create({
      data: {
        companyId,
        uploaderId,
        publicId,
        ...input,
      },
    });

    await Audit.create(
      {
        companyId,
        action: "document.created",
        actor: { type: "user", id: "" },
        context: {
          requestIp,
          userAgent,
        },
        target: [{ type: "document", id: document.id }],
        summary: `${uploaderName} uploaded a document: ${document.name}`,
      },
      tx,
    );

    return { document };
  });

  return document;
};

export const createDocumentProcedure = withAuth
  .input(ZodCreateDocumentMutationSchema)
  .mutation(async ({ ctx, input }) => {
    const user = ctx.session.user;
    const { userAgent, requestIp, db } = ctx;
    const companyId = user.companyId;

    return createDocumentHandler({
      input,
      userAgent,
      requestIp,
      db,
      companyId,
      uploaderName: user?.name,
      uploaderId: user.memberId,
    });
  });
