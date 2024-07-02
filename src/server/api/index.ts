import { PublicAPI } from "./hono";
import companyRoutes from "./routes/company";
import stakeholderRoutes from "./routes/company/stakeholder";
import teamRoutes from "./routes/company/team";

export const api = PublicAPI();

// RESTful routes for company
companyRoutes(api);

// RESTful routes for a team in a company
teamRoutes(api);

// RESTful routes for a stakeholder in a company
stakeholderRoutes(api);

export default api;
