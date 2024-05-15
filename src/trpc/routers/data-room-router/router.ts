import { generatePublicId } from "@/common/id";
import { env } from "@/env";
import {
  type DataRoomEmailPayloadType,
  sendShareDataRoomEmail,
  triggerName,
} from "@/jobs/share-data-room-email";
import { encode } from "@/lib/jwt";
import { ShareRecipientSchema } from "@/schema/contacts";
import { Audit } from "@/server/audit";
import { checkMembership } from "@/server/auth";
import { getTriggerClient } from "@/trigger";
import { createTRPCRouter, withAuth } from "@/trpc/api/trpc";
import type { DataRoom } from "@prisma/client";
import { z } from "zod";
import { DataRoomSchema } from "./schema";

export const dataRoomRouter = createTRPCRouter({
  getDataRoom: withAuth
    .input(
      z.object({
        dataRoomPublicId: z.string(),
        include: z.object({
          company: z.boolean().optional().default(false),
          documents: z.boolean().optional().default(false),
          recipients: z.boolean().optional().default(false),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const response = {
        dataRoom: {},
        documents: [],
        recipients: [],
        company: {},
      } as {
        dataRoom: object;
        documents: object[];
        recipients: object[];
        company: object;
      };

      const { db, session } = ctx;
      const { dataRoomPublicId, include } = input;

      const { dataRoom } = await db.$transaction(async (tx) => {
        const { companyId } = await checkMembership({ session, tx });

        const dataRoom = await tx.dataRoom.findUniqueOrThrow({
          where: {
            publicId: dataRoomPublicId,
            companyId,
          },
          include: {
            documents: include.documents,
            company: include.company,
            recipients: include.recipients,
          },
        });

        response.dataRoom = dataRoom;

        if (include.documents) {
          const documentIds = dataRoom.documents.map((doc) => doc.id);

          const dataRoomDocument = await tx.dataRoomDocument.findMany({
            where: {
              id: { in: documentIds },
            },

            include: {
              document: {
                select: {
                  id: true,
                  bucket: true,
                },
              },
            },
          });

          response.documents = dataRoomDocument.map((doc) => ({
            id: doc.document.bucket.id,
            name: doc.document.bucket.name,
            key: doc.document.bucket.key,
            mimeType: doc.document.bucket.mimeType,
            size: doc.document.bucket.size,
            createdAt: doc.document.bucket.createdAt,
            updatedAt: doc.document.bucket.updatedAt,
          }));
        }

        if (include.recipients) {
          response.recipients = await Promise.all(
            dataRoom.recipients.map(async (recipient) => ({
              ...recipient,
              token: await encode({
                companyId,
                dataRoomId: dataRoom.id,
                recipientId: recipient.id,
              }),
            })),
          );
        }

        return { dataRoom };
      });

      if (include.company) {
        response.company = dataRoom.company;
      }

      return response;
    }),

  save: withAuth.input(DataRoomSchema).mutation(async ({ ctx, input }) => {
    try {
      let room = {} as DataRoom;
      const { db, session, requestIp, userAgent } = ctx;

      const { publicId } = input;

      await db.$transaction(async (tx) => {
        const { companyId } = await checkMembership({ tx, session });

        if (!publicId) {
          room = await tx.dataRoom.create({
            data: {
              name: input.name,
              companyId,
              publicId: generatePublicId(),
            },
          });
        } else {
          room = await tx.dataRoom.update({
            where: {
              publicId,
            },
            data: {
              name: input.name,
            },
          });

          const { documents, recipients } = input;

          if (documents) {
            await tx.dataRoomDocument.createMany({
              data: documents.map((document) => ({
                dataRoomId: room.id,
                documentId: document.documentId,
              })),
            });
          }

          if (recipients) {
            await tx.dataRoomRecipient.createMany({
              data: recipients.map((recipient) => ({
                dataRoomId: room.id,
                email: recipient.email,
                memberId: recipient.memberId,
                stakeholderId: recipient.stakeholderId,
                expiresAt: recipient.expiresAt,
              })),
            });
          }
        }

        if (!input.publicId) {
          await Audit.create(
            {
              action: "dataRoom.created",
              companyId: session.user.companyId,
              actor: { type: "user", id: session.user.id },
              context: {
                requestIp,
                userAgent,
              },
              target: [{ type: "dataRoom", id: room.id }],
              summary: `${session.user.name} created the dataroom "${room.name}"`,
            },
            tx,
          );
        }

        if (input.publicId && input?.documents?.length) {
          await Audit.create(
            {
              action: "dataRoom.document-added",
              companyId: session.user.companyId,
              actor: { type: "user", id: session.user.id },
              context: {
                requestIp,
                userAgent,
              },
              target: [{ type: "dataRoom", id: room.id }],
              summary: `${session.user.name} added ${input.documents.length} document(s) in room "${room.name}"`,
            },
            tx,
          );
        }

        if (input.publicId && input?.recipients?.length) {
          await Audit.create(
            {
              action: "dataRoom.recipient-added",
              companyId: session.user.companyId,
              actor: { type: "user", id: session.user.id },
              context: {
                requestIp,
                userAgent,
              },
              target: [{ type: "dataRoom", id: room.id }],
              summary: `${session.user.name} added ${input.recipients.length} recipient(s) in room "${room.name}"`,
            },
            tx,
          );
        }
      });

      return {
        success: true,
        message: "Successfully updated data room",
        data: room,
      };
    } catch (error) {
      return {
        success: false,
        message:
          "Oops, something went wrong while saving data room. Please try again.",
      };
    }
  }),

  share: withAuth
    .input(
      z.object({
        dataRoomId: z.string(),
        others: z.array(ShareRecipientSchema),
        selectedContacts: z.array(ShareRecipientSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const trigger = getTriggerClient();
      const { session, db, requestIp, userAgent } = ctx;
      const { dataRoomId, others, selectedContacts } = input;
      const { name: senderName, email: senderEmail, companyId } = session.user;

      const dataRoom = await db.dataRoom.findUniqueOrThrow({
        where: {
          id: dataRoomId,
          companyId,
        },

        include: {
          company: true,
        },
      });

      if (!dataRoom) {
        throw new Error("Data room not found");
      }

      const company = dataRoom.company;

      const upsertManyRecipients = async () => {
        const baseUrl = env.BASE_URL;
        const recipients = [...others, ...selectedContacts];

        for (const recipient of recipients) {
          const email = (recipient.email || recipient.value).trim();
          if (!email) {
            throw new Error("Email is required");
          }

          const memberOrStakeholderId =
            recipient.type === "member"
              ? { memberId: recipient.id }
              : recipient.type === "stakeholder"
                ? { stakeholderId: recipient.id }
                : {};

          const { recipientRecord } = await db.$transaction(async (tx) => {
            const recipientRecord = await tx.dataRoomRecipient.upsert({
              where: {
                dataRoomId_email: {
                  dataRoomId,
                  email,
                },
              },
              create: {
                dataRoomId,
                name: recipient.name,
                email,
                ...memberOrStakeholderId,
              },
              update: {
                name: recipient.name,
                ...memberOrStakeholderId,
              },
            });
            await Audit.create(
              {
                action: "dataRoom.shared",
                companyId: session.user.companyId,
                actor: { type: "user", id: session.user.id },
                context: {
                  requestIp,
                  userAgent,
                },
                target: [{ type: "dataRoom", id: dataRoomId }],
                summary: `${session.user.name} shared the dataroom "${dataRoom.name}"`,
              },
              tx,
            );

            return { recipientRecord };
          });

          const token = await encode({
            companyId,
            dataRoomId,
            recipientId: recipientRecord.id,
          });

          const link = `${baseUrl}/data-rooms/${dataRoom.publicId}?token=${token}`;

          const payload: DataRoomEmailPayloadType = {
            senderName: senderName!,
            recipientName: recipient.name,
            companyName: company.name,
            dataRoom: dataRoom.name,
            link,
            email,
            senderEmail,
          };

          if (trigger) {
            await trigger.sendEvent({ name: triggerName, payload });
          } else {
            await sendShareDataRoomEmail(payload);
          }
        }
      };

      await upsertManyRecipients();

      return {
        success: true,
        message: "Data room successfully shared!",
      };
    }),

  unShare: withAuth
    .input(
      z.object({
        dataRoomId: z.string(),
        recipientId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        session: { user },
        db,
        requestIp,
        userAgent,
      } = ctx;
      const { dataRoomId, recipientId } = input;
      const companyId = user.companyId;

      await db.$transaction(async (tx) => {
        const dataRoom = await db.dataRoom.findUniqueOrThrow({
          where: {
            id: dataRoomId,
            companyId,
          },
        });

        if (!dataRoom) {
          throw new Error("Data room not found");
        }

        await db.dataRoomRecipient.delete({
          where: {
            id: recipientId,
            dataRoomId,
          },
        });

        await Audit.create(
          {
            action: "dataRoom.unshared",
            companyId: user.companyId,
            actor: { type: "user", id: user.id },
            context: {
              requestIp,
              userAgent,
            },
            target: [{ type: "dataRoom", id: dataRoomId }],
            summary: `${user.name} unshared the dataroom "${dataRoom.name}"`,
          },
          tx,
        );
      });
      return {
        success: true,
        message: "Successfully removed access to data room!",
      };
    }),
});
