/* eslint-disable @typescript-eslint/prefer-for-of */
import { withAuth } from "@/trpc/api/trpc";
import { ZodAddFieldMutationSchema } from "../schema";
import { render } from "jsx-email";
import { env } from "@/env";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import EsignEmail from "@/emails/EsignEmail";
import { sendMail } from "@/server/mailer";

interface SendEmailOptions {
  email: string;
  token: string;
}

const emailTokenPayloadSchema = z.object({
  id: z.string(),
  rec: z.string(),
  group: z.string(),
});

type TEmailTokenPayloadSchema = z.infer<typeof emailTokenPayloadSchema>;

interface EncodeEmailTokenOption {
  group: string;
  templateId: string;
  recipientId: string;
}

const secret = new TextEncoder().encode(env.NEXTAUTH_SECRET);

export function EncodeEmailToken({
  group,
  recipientId,
  templateId,
}: EncodeEmailTokenOption) {
  const encodeToken: TEmailTokenPayloadSchema = {
    rec: recipientId,
    id: templateId,
    group,
  };

  return new SignJWT(encodeToken)
    .setProtectedHeader({ alg: "HS256" })
    .sign(secret);
}

export async function DecodeEmailToken(jwt: string) {
  const { payload } = await jwtVerify(jwt, secret);

  return emailTokenPayloadSchema.parse(payload);
}

export async function SendEsignEmail({ email, token }: SendEmailOptions) {
  const baseUrl = env.NEXTAUTH_URL;
  const html = await render(
    EsignEmail({
      signingLink: `${baseUrl}/sign/${token}`,
    }),
  );
  await sendMail({
    to: email,
    subject: "esign Link",
    html,
  });
}

export const addFieldProcedure = withAuth
  .input(ZodAddFieldMutationSchema)
  .mutation(async ({ ctx, input }) => {
    const user = ctx.session.user;
    const { fields, orderedDelivery, recipients, templatePublicId } = input;

    const mails: Promise<void>[] = [];
    await ctx.db.$transaction(async (tx) => {
      const template = await tx.template.findFirstOrThrow({
        where: {
          publicId: templatePublicId,
          companyId: user.companyId,
        },
        select: {
          id: true,
        },
      });
      await tx.templateField.deleteMany({
        where: {
          templateId: template.id,
        },
      });

      const data = fields.map((item) => ({
        ...item,
        templateId: template.id,
      }));

      await tx.templateField.createMany({ data });

      await tx.template.update({
        where: {
          id: template.id,
        },
        data: {
          status: "COMPLETE",
          orderedDelivery,
        },
      });

      await tx.esignRecipient.createMany({
        data: recipients.map((data) => ({ ...data, templateId: template.id })),
        skipDuplicates: true,
      });

      const recipientList = await tx.esignRecipient.findMany({
        where: {
          templateId: template.id,
        },
        select: {
          id: true,
          email: true,
          group: true,
        },
      });

      for (let index = 0; index < recipientList.length; index++) {
        const item = recipientList[index];

        if (!item) {
          throw new Error("item not found");
        }

        const token = await EncodeEmailToken({
          group: item.group,
          recipientId: item.id,
          templateId: template.id,
        });
        const email = item.email;

        mails.push(SendEsignEmail({ token, email }));

        if (orderedDelivery) {
          break;
        }
      }
    });
    await Promise.all(mails);
    return {};
  });
