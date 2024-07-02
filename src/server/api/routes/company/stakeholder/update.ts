import { withCompanyAuth } from "@/server/api/auth";
import { ApiError, ErrorResponses } from "@/server/api/error";
import {
  StakeholderApiResponseSchema,
  UpdateStakeholderRequestSchema,
} from "@/server/api/schema/stakeholder";
import { getIp } from "@/server/api/utils";
import { db } from "@/server/db";
import { createRoute, z } from "@hono/zod-openapi";

import type { PublicAPI } from "@/server/api/hono";
import { updateStakeholder } from "@/server/services/stakeholder/update-stakeholder";
import type { Context } from "hono";
import { RequestParamsSchema } from "./delete";

const RequestQuerySchema = z.object({
  data: UpdateStakeholderRequestSchema,
});

const ResponseSchema = z.object({
  data: StakeholderApiResponseSchema,
});

const route = createRoute({
  method: "put",
  path: "api/v1/companies/:id/stakeholders/:stakeholderId",
  request: { params: RequestParamsSchema, query: RequestQuerySchema },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ResponseSchema,
        },
      },
      description: "Add stakeholders to a company",
    },

    ...ErrorResponses,
  },
});

const update = (app: PublicAPI) => {
  //@ts-ignore
  app.openapi(route, async (c: Context) => {
    const { company, user } = await withCompanyAuth(c);
    const params = c.req.param();
    const stakeholderId = params.stakeholderId as string;
    const body = await c.req.json();

    const payload = {
      stakeholderId: stakeholderId,
      companyId: company.id,
      requestIp: getIp(c.req),
      userAgent: c.req.header("User-Agent") || "",
      data: body,
      user: {
        id: user.id,
        name: user.name as string,
      },
    };

    const updatedStakeholder = await updateStakeholder({
      db,
      payload,
    });

    if (!updatedStakeholder) {
      throw new ApiError({
        code: "BAD_REQUEST",
        message: "Stakeholder not updated",
      });
    }

    return c.json({ data: updatedStakeholder }, 200);
  });
};

export default update;
