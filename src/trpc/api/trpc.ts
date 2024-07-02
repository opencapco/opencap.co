/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { getIp, getUserAgent } from "@/lib/headers";
import { RBAC, type addPolicyOption } from "@/lib/rbac";
import {
  checkAccessControlMembership,
  getPermissions,
} from "@/lib/rbac/access-control";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";

interface Meta {
  policies: addPolicyOption;
}

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getServerAuthSession();

  return {
    db,
    session,
    requestIp: getIp(opts.headers),
    userAgent: getUserAgent(opts.headers),
    ...opts,
  };
};

export type CreateTRPCContextType = Awaited<
  ReturnType<typeof createTRPCContext>
>;

const withAuthTrpcContext = ({ session, ...rest }: CreateTRPCContextType) => {
  if (!session || !session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return {
    ...rest,
    // infers the `session` as non-nullable
    session: { ...session, user: session.user },
  };
};

export type withAuthTrpcContextType = ReturnType<typeof withAuthTrpcContext>;

const withAccessControlTrpcContext = async ({
  meta,
  ...rest
}: CreateTRPCContextType & { meta: Meta | undefined }) => {
  const ctx = withAuthTrpcContext({ ...rest });

  const rbac = new RBAC();

  if (meta?.policies) {
    rbac.addPolicies(meta.policies);
  }

  const { err: membershipError, val: membership } =
    await checkAccessControlMembership({
      session: ctx.session,
      tx: ctx.db,
    });

  if (membershipError) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: membershipError.message,
    });
  }

  const permissions = getPermissions(membership.role);

  const { err, val } = rbac.enforce(permissions);

  if (err) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: err.message,
    });
  }

  if (!val.valid) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: val.message,
    });
  }

  return {
    ...ctx,
    membership,
    permissions,
  };
};

export type withAccessControlTrpcContextType = ReturnType<
  typeof withAccessControlTrpcContext
>;

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC
  .context<typeof createTRPCContext>()
  .meta<Meta>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const withoutAuth = t.procedure;

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const withAuth = t.procedure.use(({ ctx: ctx_, next }) => {
  const ctx = withAuthTrpcContext(ctx_);

  return next({
    ctx,
  });
});

export const withAccessControl = t.procedure.use(
  async ({ ctx: ctx_, next, meta }) => {
    const ctx = await withAccessControlTrpcContext({ ...ctx_, meta });

    return next({
      ctx,
    });
  },
);
