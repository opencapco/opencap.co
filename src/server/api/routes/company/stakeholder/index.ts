import type { PublicAPI } from "@/server/api/hono";
// import create from "./create";
// import delete from "./delete";
import getMany from "./getMany";
// import getOne from "./getOne";
// import update from "./update";

const stakeholderRoutes = (api: PublicAPI) => {
  // getOne(api);
  getMany(api);
  // create(api);
  // update(api);
  // delete(api);
};

export default stakeholderRoutes;
