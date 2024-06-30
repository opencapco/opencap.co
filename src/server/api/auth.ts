import { verifySecureHash } from "@/lib/crypto";
import { ApiError } from "@/server/api/error";
import { db } from "@/server/db";
import type { Context } from "hono";

export const withMemberAuth = async (c: Context) => {
  const bearerToken = await getBearerToken(c);
  const user = await verifyBearerToken(bearerToken);
  const membership = await db.member.findMany({
    where: { userId: user.id, status: "ACTIVE" },
  });

  if (!membership.length) {
    throw new ApiError({
      code: "FORBIDDEN",
      message: "You do not have access to any companies",
    });
  }

  return { user, membership };
};

export const withCompanyAuth = async (c: Context) => {
  const params = c.req.param();
  const id = params.id as string;

  const bearerToken = await getBearerToken(c);
  const user = await verifyBearerToken(bearerToken);
  const member = await db.member.findFirst({
    where: {
      userId: user.id,
      companyId: id,
    },
  });

  if (!member) {
    throw new ApiError({
      code: "FORBIDDEN",
      message: "You do not have access to this company",
    });
  }

  const company = await db.company.findUnique({
    where: { id },
  });

  if (!company) {
    throw new ApiError({
      code: "NOT_FOUND",
      message: "Company not found",
    });
  }

  return { user, company, member };
};

export const getBearerToken = async (c: Context) => {
  const bearerToken = await c.req.header("Authorization");

  if (!bearerToken) {
    throw new ApiError({
      code: "UNAUTHORIZED",
      message: "No bearer token provided",
    });
  }

  return bearerToken;
};

const verifyBearerToken = async (bearerToken: string | null | undefined) => {
  if (!bearerToken) {
    throw new ApiError({
      code: "UNAUTHORIZED",
      message: "No bearer token provided",
    });
  }

  const bearer = bearerToken.split(" ")[1];
  if (!bearer) {
    throw new ApiError({
      code: "UNAUTHORIZED",
      message: "No bearer token provided",
    });
  }

  const [keyId, token] = bearer.split(":");

  if (!keyId || !token) {
    throw new ApiError({
      code: "UNAUTHORIZED",
      message: "Invalid token provided",
    });
  }

  const apiKey = await db.apiKey.findUnique({
    where: { keyId, active: true },
    select: { id: true, keyId: true, hashedToken: true, user: true },
  });

  if (!apiKey) {
    throw new ApiError({
      code: "UNAUTHORIZED",
      message: "Invalid token provided",
    });
  }

  const isValid = await verifySecureHash(token, apiKey.hashedToken);

  if (!isValid) {
    throw new ApiError({
      code: "UNAUTHORIZED",
      message: "Invalid token provided",
    });
  }

  await db.apiKey.update({
    where: { keyId },
    data: { lastUsed: new Date() },
  });

  return apiKey.user;
};
