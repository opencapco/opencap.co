import { SendMemberInviteEmailJob } from "@/jobs/member-inivite-email";
import { generatePasswordResetToken } from "@/lib/token";
import { withCompanyAuth } from "@/server/api/auth";
import { ApiError, ErrorResponses } from "@/server/api/error";
import type { PublicAPI } from "@/server/api/hono";
import { Audit } from "@/server/audit";
import { db } from "@/server/db";
import { checkUserMembershipForInvitation } from "@/server/services/team-members/check-user-membership";
import { createTeamMember } from "@/server/services/team-members/create-team-member";
import { createRoute, z } from "@hono/zod-openapi";
import type { Context, HonoRequest } from "hono";

const TeamMemberSchema = z
  .object({
    title: z.string().openapi({
      example: "Software Engineer",
    }),
    name: z.string().openapi({
      example: "Xyz Corp",
    }),
    email: z.string().openapi({
      example: "john@xyz.inc",
    }),
  })
  .openapi("TeamMember");

const route = createRoute({
  method: "post",
  path: "/v1/companies/:id/teams",
  request: {
    body: {
      content: {
        "application/json": {
          schema: TeamMemberSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: "Create and invite a team member to a company",
    },

    ...ErrorResponses,
  },
});

const getIp = (req: HonoRequest) => {
  return (
    req.header("x-forwarded-for") || req.header("remoteAddr") || "Unknown IP"
  );
};

const create = (app: PublicAPI) => {
  app.openapi(route, async (c: Context) => {
    const companyId = c.req.param("id");
    const { company, user } = await withCompanyAuth(companyId, c.req.header);

    const { name, title, email } = c.req.valid("json");

    const { verificationToken } = await db.$transaction(async (tx) => {
      const newUserOnTeam = await checkUserMembershipForInvitation(tx, {
        name,
        email,
        companyId: company.id,
      });

      if (!newUserOnTeam) {
        throw new ApiError({
          code: "BAD_REQUEST",
          message: "user already a member",
        });
      }

      const { member, verificationToken } = await createTeamMember(tx, {
        userId: newUserOnTeam.id,
        companyId: company.id,
        name,
        email,
        title,
      });

      await Audit.create(
        {
          action: "member.invited",
          companyId: company.id,
          actor: { type: "user", id: user.id },
          context: {
            requestIp: getIp(c.req),
            userAgent: c.req.header("User-Agent") || "",
          },
          target: [{ type: "user", id: member.userId }],
          summary: `${user.name} invited ${member.user?.name} to join ${company.name}`,
        },
        tx,
      );

      return { verificationToken };
    });

    const { token: passwordResetToken } =
      await generatePasswordResetToken(email);

    const payload = {
      verificationToken,
      passwordResetToken,
      email,
      company,
      user: {
        email: user.email,
        name: user.name,
      },
    };

    await new SendMemberInviteEmailJob().emit(payload);

    return c.json({ message: "Team member created." });
  });
};

export default create;
