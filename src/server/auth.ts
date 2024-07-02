/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import {
  type DefaultSession,
  type NextAuthOptions,
  type Session,
  getServerSession,
} from "next-auth";

import { env } from "@/env";
import { getAuthenticatorOptions } from "@/lib/authenticator";
import {
  type TAuthenticationResponseJSONSchema,
  ZAuthenticationResponseJSONSchema,
} from "@/lib/types";
import type { MemberStatusEnum } from "@/prisma/enums";
import { type TPrismaOrTransaction, db } from "@/server/db";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getUserByEmail, getUserById } from "./user";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const JWT_SECRET = new TextEncoder().encode(env.NEXTAUTH_SECRET);

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isOnboarded: boolean;
      companyId: string;
      memberId: string;
      companyPublicId: string;
      status: MemberStatusEnum | "";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    companyId: string;
    memberId: string;
    isOnboarded: boolean;
    companyPublicId: string;
    status: MemberStatusEnum | "";
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id);
      if (!existingUser?.emailVerified) return false;

      return true;
    },
    session({ session, token }) {
      session.user.isOnboarded = token.isOnboarded;
      session.user.companyId = token.companyId;
      session.user.memberId = token.memberId;
      session.user.companyPublicId = token.companyPublicId;
      session.user.status = token.status;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.picture ?? "";

      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },

    async jwt({ token, trigger }) {
      if (trigger) {
        const member = await db.member.findFirst({
          where: {
            userId: token.sub,
            isOnboarded: true,
            status: "ACTIVE",
          },
          orderBy: {
            lastAccessed: "desc",
          },
          select: {
            id: true,
            status: true,
            companyId: true,
            isOnboarded: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
            company: {
              select: {
                publicId: true,
              },
            },
          },
        });
        if (member) {
          token.status = member.status;
          token.name = member.user?.name;
          token.memberId = member.id;
          token.companyId = member.companyId;
          token.isOnboarded = member.isOnboarded;
          token.companyPublicId = member.company.publicId;
          token.picture = member.user?.image;
        } else {
          token.status = "";
          token.companyId = "";
          token.memberId = "";
          token.isOnboarded = false;
          token.companyPublicId = "";
        }
      }
      return token;
    },
  },
  adapter: PrismaAdapter(db),
  secret: env.NEXTAUTH_SECRET ?? "secret",
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials) {
          const { email, password } = credentials;
          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        return null;
      },
    }),

    CredentialsProvider({
      id: "webauthn",
      name: "Keypass",
      credentials: {
        csrfToken: { label: "csrfToken", type: "csrfToken" },
      },
      async authorize(credentials, req) {
        const csrfToken = credentials?.csrfToken;

        if (typeof csrfToken !== "string" || csrfToken.length === 0) {
          throw new Error("Invalid csrfToken");
        }

        let requestBodyCrediential: TAuthenticationResponseJSONSchema | null =
          null;

        try {
          //eslint-disable-next-line  @typescript-eslint/no-unsafe-argument
          const parsedBodyCredential = JSON.parse(req.body?.credential);
          requestBodyCrediential =
            ZAuthenticationResponseJSONSchema.parse(parsedBodyCredential);
        } catch {
          throw new Error("Invalid request");
        }

        const challengeToken = await db.passkeyVerificationToken
          .delete({
            where: {
              id: csrfToken,
            },
          })
          .catch(() => null);

        if (!challengeToken) {
          return null;
        }

        if (challengeToken.expiresAt < new Date()) {
          throw new Error("Challenge token has expired.");
        }

        const passkey = await db.passkey.findFirst({
          where: {
            credentialId: Buffer.from(requestBodyCrediential.id),
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                emailVerified: true,
              },
            },
          },
        });

        if (!passkey) {
          throw new Error("Cannot setup passkey.");
        }

        const user = passkey.user;

        const { rpId, origin } = getAuthenticatorOptions();

        const verification = await verifyAuthenticationResponse({
          response: requestBodyCrediential,
          expectedChallenge: challengeToken.token,
          expectedOrigin: origin,
          expectedRPID: rpId,
          authenticator: {
            //@ts-expect-error error
            credentialID: new Uint8Array(Array.from(passkey.credentialId)),
            credentialPublicKey: new Uint8Array(passkey.credentialPublicKey),
            counter: Number(passkey.counter),
          },
        }).catch(() => null);

        //@TODO (Add audits for verification.verified event)

        await db.passkey.update({
          where: {
            id: passkey.id,
          },
          data: {
            lastUsedAt: new Date(),
            counter: verification?.authenticationInfo.newCounter,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified?.toISOString() ?? null,
        };
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID as string,
      clientSecret: GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  pages: {
    signIn: "/login",
    signOut: "/login",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);

export const withServerSession = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("session not found");
  }

  return session;
};

export interface checkMembershipOptions {
  session: Session;
  tx: TPrismaOrTransaction;
}

export async function checkMembership({ session, tx }: checkMembershipOptions) {
  const data = await tx.member.findFirst({
    where: {
      id: session.user.memberId,
      companyId: session.user.companyId,
      isOnboarded: true,
    },
    select: {
      id: true,
      companyId: true,
      role: true,
    },
  });

  if (!data) {
    throw new Error("membership not found");
  }

  const { companyId, id: memberId, ...rest } = data;

  return { companyId, memberId, ...rest };
}
