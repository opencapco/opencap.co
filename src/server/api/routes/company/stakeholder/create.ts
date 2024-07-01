import { withCompanyAuth } from "@/server/api/auth";
import { ErrorResponses } from "@/server/api/error";
import {
  AddStakeholderRequestSchema,
  StakeholderApiResponseSchema,
} from "@/server/api/schema/stakeholder";
import { getIp } from "@/server/api/utils";
import { db } from "@/server/db";
import { addStakeholders } from "@/server/services/stakeholder/add-stakeholders";
import { createRoute, z } from "@hono/zod-openapi";

import type { PublicAPI } from "@/server/api/hono";
import type { Context } from "hono";
import { RequestParamsSchema } from "./getMany";

const RequestQuerySchema = z.object({
  data: z.array(AddStakeholderRequestSchema).openapi({
    description: "Add stakeholders to a company.",
  }),
});

const ResponseSchema = z.object({
  data: StakeholderApiResponseSchema,
});

const route = createRoute({
  method: "post",
  path: "api/v1/companies/:id/stakeholders",
  request: { params: RequestParamsSchema, query: RequestQuerySchema },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ResponseSchema,
        },
      },
      description: "Add stakeholders to a company.",
    },

    ...ErrorResponses,
  },
});

const create = (app: PublicAPI) => {
  //@ts-ignore
  app.openapi(route, async (c: Context) => {
    const { company, user } = await withCompanyAuth(c);
    const body = await c.req.json();

    const payload = {
      companyId: company.id,
      requestIp: getIp(c.req),
      userAgent: c.req.header("User-Agent") || "",
      user: {
        id: user.id,
        name: user.name as string,
      },
      data: body,
    };

    await addStakeholders({
      db,
      payload,
    });

    return c.json({ message: "Stakeholders added successfully" }, 200);
  });
};

export default create;
