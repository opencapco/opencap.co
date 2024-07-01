import { withCompanyAuth } from "@/server/api/auth";
import { ErrorResponses } from "@/server/api/error";
import type { PublicAPI } from "@/server/api/hono";
import { ProxyPrismaModel } from "@/server/api/pagination/prisma-proxy";
import {
  PaginationQuerySchema,
  PaginationResponseSchema,
  type TPaginationQuerySchema,
} from "@/server/api/schema/pagination";
import { StakeholderApiResponseSchema } from "@/server/api/schema/stakeholder";
import { db } from "@/server/db";
import { createRoute, z } from "@hono/zod-openapi";
import type { Context } from "hono";

export const RequestParamsSchema = z.object({
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
  data: StakeholderApiResponseSchema,
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
  //@ts-ignore
  app.openapi(route, async (c: Context) => {
    const { company } = await withCompanyAuth(c);
    const body: TPaginationQuerySchema = await c.req.json();

    const queryCriteria = {
      where: {
        companyId: company.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    };

    const paginationData = {
      limit: body.limit,
      cursor: body.cursor,
    };

    //@ts-ignore
    const prismaModel = ProxyPrismaModel(db.stakeholder);
    const { data, count, total, cursor } = await prismaModel.findManyPaginated(
      queryCriteria,
      paginationData,
    );

    return c.json({
      data: data,
      meta: {
        data,
        count,
        total,
        cursor,
      },
    });
  });
};

export default getMany;
