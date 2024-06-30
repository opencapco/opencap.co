import { logger } from "@/lib/logger";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { StatusCode } from "hono/utils/http-status";
import { z } from "zod";

const ErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

const ErrorContent = {
  "application/json": {
    schema: ErrorSchema,
  },
};

export const ErrorResponses = {
  400: {
    content: ErrorContent,
    description: "Bad Request",
  },

  401: {
    content: ErrorContent,
    description: "Unauthorized",
  },

  404: {
    content: ErrorContent,
    description: "Not Found",
  },

  429: {
    content: ErrorContent,
    description: "Rate Limited",
  },

  500: {
    content: ErrorContent,
    description: "Internal Server Error",
  },
};

const ErrorCode = z.enum([
  "BAD_REQUEST",
  "FORBIDDEN",
  "INTERNAL_SERVER_ERROR",
  "NOT_FOUND",
  "NOT_UNIQUE",
  "RATE_LIMITED",
  "UNAUTHORIZED",
  "METHOD_NOT_ALLOWED",
]);

function codeToStatus(code: z.infer<typeof ErrorCode>): StatusCode {
  switch (code) {
    case "BAD_REQUEST":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "METHOD_NOT_ALLOWED":
      return 405;
    case "NOT_UNIQUE":
      return 409;
    case "RATE_LIMITED":
      return 429;
    case "INTERNAL_SERVER_ERROR":
      return 500;
  }
}

function statusToCode(status: StatusCode): z.infer<typeof ErrorCode> {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 405:
      return "METHOD_NOT_ALLOWED";
    case 409:
      return "NOT_UNIQUE";
    case 429:
      return "RATE_LIMITED";
    case 500:
      return "INTERNAL_SERVER_ERROR";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}

export class ApiError extends HTTPException {
  public readonly code: z.infer<typeof ErrorCode>;

  constructor({
    code,
    message,
  }: {
    code: z.infer<typeof ErrorCode>;
    message: string;
  }) {
    super(codeToStatus(code), { message });
    this.code = code;
  }
}

export function handleError(err: Error, c: Context): Response {
  if (err instanceof ApiError) {
    if (err.status >= 500) {
      logger.error("ApiError", {
        name: err.name,
        code: err.code,
        status: err.status,
        message: err.message,
      });
    }
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
        },
      },
      { status: err.status },
    );
  }

  if (err instanceof HTTPException) {
    if (err.status >= 500) {
      logger.error("HTTPException", {
        name: err.name,
        status: err.status,
        message: err.message,
      });
    }
    const code = statusToCode(err.status);
    return c.json(
      {
        error: {
          code,
          message: err.message,
        },
      },
      { status: err.status },
    );
  }

  /**
   * This is a generic error, we should log it and return a 500
   */

  logger.error("UnhandledError", {
    name: err.name,
    message: err.message,
    cause: err.cause,
    stack: err.stack,
  });

  return c.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong, our engineers have been notified.",
      },
    },
    { status: 500 },
  );
}

export const companyNotFound = () => {
  throw new ApiError({
    code: "NOT_FOUND",
    message: "Company not found",
  });
};
