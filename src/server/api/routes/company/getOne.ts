import { withCompanyAuth } from "@/server/api/auth";
import { ApiError, ErrorResponses } from "@/server/api/error";
import type { PublicAPI } from "@/server/api/hono";
import { ApiCompanySchema } from "@/server/api/schema/company";
import { createRoute, z } from "@hono/zod-openapi";
import type { Context } from "hono";

export const RequestSchema = z.object({
  id: z
    .string()
    .cuid()
    .openapi({
      description: "Company ID",
      param: {
        name: "id",
        in: "path",
      },

      example: "clxwbok580000i7nge8nm1ry0",
    }),
});

const route = createRoute({
  method: "get",
  path: "/v1/companies/:id",
  request: { params: RequestSchema },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ApiCompanySchema,
        },
      },
      description: "Get a company by ID",
    },

    ...ErrorResponses,
  },
});
const getOne = (app: PublicAPI) => {
  app.openapi(route, async (c: Context) => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const { company } = (await withCompanyAuth(c)) as { company: any };

    if (!company) {
      throw new ApiError({
        code: "NOT_FOUND",
        message: "Company not found",
      });
    }

    return c.json(company, 200);
  });
};

export default getOne;
