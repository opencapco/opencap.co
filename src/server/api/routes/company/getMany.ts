import { withMemberAuth } from "@/server/api/auth";
import { ErrorResponses } from "@/server/api/error";
import type { PublicAPI } from "@/server/api/hono";
import { ApiCompanySchema } from "@/server/api/schema/company";
import { db } from "@/server/db";
import { createRoute, z } from "@hono/zod-openapi";
import type { Company } from "@prisma/client";
import type { Context } from "hono";

const route = createRoute({
  method: "get",
  path: "/v1/companies",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(ApiCompanySchema).openapi({
            description: "List of companies",
          }),
        },
      },
      description: "List companies",
    },

    ...ErrorResponses,
  },
});
const getMany = (app: PublicAPI) => {
  app.openapi(route, async (c: Context) => {
    const { membership } = await withMemberAuth(c);
    const companyIds = membership.map((m) => m.companyId);

    const companies = (await db.company.findMany({
      where: {
        id: {
          in: companyIds,
        },
      },
    })) as Company[];

    const response = companies.map((company) => ({
      ...company,
      logo: company.logo ?? undefined,
      website: company.website ?? undefined,
    }));

    return c.json(response, 200);
  });
};

export default getMany;
