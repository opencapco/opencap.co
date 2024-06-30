import { ErrorResponses } from "@/server/api/error";
import type { PublicAPI } from "@/server/api/hono";
import {
  PaginationQuerySchema,
  PaginationResponseSchema,
} from "@/server/api/schema/pagination";
import { StakeholderApiSchema } from "@/server/api/schema/stakeholder";
import { createRoute, z } from "@hono/zod-openapi";
import type { Context, HonoRequest } from "hono";

const RequestParamsSchema = z.object({
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

const ResponseSchema = z.object({
  data: StakeholderApiSchema,
  meta: PaginationResponseSchema,
});

const route = createRoute({
  method: "get",
  path: "/v1/companies/:id/stakeholders",
  request: {
    query: PaginationQuerySchema,
    params: RequestParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ResponseSchema,
        },
      },
      description: "Get a paginated list of stakeholders for a company.",
    },

    ...ErrorResponses,
  },
});

const getMany = (app: PublicAPI) => {
  app.openapi(route, async (c: Context) => {
    const req: HonoRequest = await c.req;
    // const { id } = req.params;

    // TODO : Implement the logic to fetch stakeholders from the database, please take a look at this doc for reference: https://www.prisma.io/docs/concepts/components/prisma-client/crud
    // https://www.prisma.io/docs/orm/prisma-client/queries/pagination#cursor-based-pagination

    // return c.json({
    //   data: [],
    //   meta: {
    //     count: 0,
    //     total: 0,
    //     cursor: null,
    //   },
    // });
  });
};

export default getMany;
