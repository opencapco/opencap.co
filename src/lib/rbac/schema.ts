import { ACTIONS, SUBJECTS, type TActions } from "@/constants/rbac";
import { z } from "zod";

export const permissionSchema = z.object({
  actions: z.array(z.enum(ACTIONS)),
  subject: z.enum(SUBJECTS),
});

export type TPermission = z.infer<typeof permissionSchema>;
