import type { PublicAPI } from "@/server/api/hono";
import getMany from "./getMany";
import getOne from "./getOne";

const companyRoutes = (api: PublicAPI) => {
  getOne(api);
  getMany(api);
};

export default companyRoutes;
