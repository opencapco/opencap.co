import { z } from "zod";

export const AuditSchema = z.object({
  companyId: z.string(),
  action: z.enum([
    "user.signed-up",
    "user.onboarded",

    "company.created",
    "company.audited",
    "company.switched",
    "company.updated",

    "member.invited",
    "member.re-invited",
    "member.accepted",
    "member.updated",
    "member.removed",
    "member.revoked-invite",
    "member.deactivated",
    "member.activated",

    "shareClass.created",
    "shareClass.updated",
    "shareClass.deleted",

    "equityPlan.created",
    "equityPlan.updated",
    "equityPlan.deleted",

    "document.created",
    "document.deleted",

    "option.created",
    "option.deleted",

    "safe.created",
    "safe.imported",
    "safe.sent",
    "safe.signed",
    "safe.deleted",

    "documentShare.created",

    "stakeholder.added",

    "bucket.created",

    "update.saved",
    "update.sent",
    "update.cloned",

    "template.created",

    "dataRoom.created",
    "dataRoom.document-added",
    "dataRoom.recipient-added",
    "dataRoom.shared",
    "dataRoom.unshared",
  ]),
  occurredAt: z.date().optional(),
  actor: z.object({
    type: z.enum(["user", "company", "document", "option"]),
    id: z.string().optional().nullable(),
  }),

  target: z.array(
    z.object({
      type: z.enum([
        "user",
        "company",
        "document",
        "option",
        "documentShare",
        "bucket",
        "update",
        "template",
        "dataRoom",
      ]),
      id: z.string().optional().nullable(),
    }),
  ),

  context: z.object({
    requestIp: z.string(),
    userAgent: z.string(),
  }),

  summary: z.string().optional(),
});

export type AuditSchemaType = z.infer<typeof AuditSchema>;

export const getActions = () => {
  const actions = AuditSchema.shape.action.Values;
  return Object.values(actions).map((action) => ({
    label: action,
    value: action,
  }));
};

export const EsignAuditSchema = z.object({
  action: z.enum([
    "document.complete",
    "recipient.signed",
    "document.email.sent",
  ]),
  occurredAt: z.date().optional(),
  templateId: z.string(),
  recipientId: z.string().optional(),
  companyId: z.string(),
  ip: z.string(),
  userAgent: z.string(),
  location: z.string(),
  summary: z.string(),
});

export type TEsignAuditSchema = z.infer<typeof EsignAuditSchema>;
