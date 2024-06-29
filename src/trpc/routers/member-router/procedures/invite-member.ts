import { SendMemberInviteEmailJob } from "@/jobs/member-inivite-email";
import { generatePasswordResetToken } from "@/lib/token";
import { Audit } from "@/server/audit";
import { checkMembership } from "@/server/auth";
import { checkUserMembershipForInvitation } from "@/server/services/team-members/check-user-membership";
import { createTeamMember } from "@/server/services/team-members/create-team-member";
import { withAuth } from "@/trpc/api/trpc";
import { TRPCError } from "@trpc/server";
import { ZodInviteMemberMutationSchema } from "../schema";

export const inviteMemberProcedure = withAuth
  .input(ZodInviteMemberMutationSchema)
  .mutation(async ({ ctx, input }) => {
    const user = ctx.session.user;
    const { name, email, title } = input;
    const { userAgent, requestIp, session } = ctx;

    const { token: passwordResetToken } =
      await generatePasswordResetToken(email);

    const { company, verificationToken } = await ctx.db.$transaction(
      async (tx) => {
        const { companyId } = await checkMembership({ session, tx });

        const company = await tx.company.findFirstOrThrow({
          where: {
            id: companyId,
          },
          select: {
            name: true,
            id: true,
          },
        });

        const newUserOnTeam = await checkUserMembershipForInvitation(tx, {
          name,
          email,
          companyId: company.id,
        });

        if (!newUserOnTeam) {
          throw new TRPCError({
            code: "FORBIDDEN",
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
              requestIp,
              userAgent,
            },
            target: [{ type: "user", id: member.userId }],
            summary: `${user.name} invited ${member.user?.name} to join ${company.name}`,
          },
          tx,
        );

        return { verificationToken, company };
      },
    );

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

    return { success: true };
  });
