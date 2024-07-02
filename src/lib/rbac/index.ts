import type { TActions, TSubjects } from "@/constants/rbac";
import { Ok, type Result } from "../error";
import type { TPermission } from "./schema";

type Effect = "allow" | "deny";

export type addPolicyOption = Partial<
  Record<TSubjects, { allow?: TActions[]; deny?: TActions[] }>
>;

export class RBAC {
  private policy: Map<TSubjects, Map<Effect, Set<TActions>>>;

  constructor() {
    this.policy = new Map();
  }

  allow(subject: TSubjects, action: TActions): RBAC {
    this.register(subject, action, "allow");

    return this;
  }

  deny(subject: TSubjects, action: TActions): RBAC {
    this.register(subject, action, "deny");

    return this;
  }

  private register(subject: TSubjects, action: TActions, effect: Effect) {
    let subjectMap = this.policy.get(subject);

    if (!subjectMap) {
      subjectMap = new Map();
      this.policy.set(subject, subjectMap);
    }

    let actionSet = subjectMap.get(effect);

    if (!actionSet) {
      actionSet = new Set();
      subjectMap.set(effect, actionSet);
    }

    actionSet.add(action);
  }

  enforce(
    permissions: TPermission[],
  ): Result<{ valid: boolean; message: string }> {
    const permissionSubjects = new Set(permissions.map((item) => item.subject));
    for (const subject of this.policy.keys()) {
      if (!permissionSubjects.has(subject)) {
        return Ok({
          valid: false,
          message: `No matching permissions found for action: ${subject}`,
        });
      }
    }

    for (const perm of permissions) {
      const { actions, subject } = perm;

      const rules = this.policy.get(subject);

      if (rules) {
        const deniedActions = rules.get("deny");
        const allowedActions = rules.get("allow");

        if (
          deniedActions &&
          (deniedActions.has("*") ||
            actions.some((action) => deniedActions.has(action)))
        ) {
          return Ok({
            valid: false,
            message: `Permission denied for actions: ${actions.join(", ")}`,
          });
        }

        if (actions.includes("*")) {
          continue;
        }

        if (
          allowedActions &&
          (allowedActions.has("*") ||
            actions.some((action) => allowedActions.has(action)))
        ) {
          continue;
        }

        return Ok({
          valid: false,
          message: `No matching permissions found for actions: ${actions.join(
            ", ",
          )}`,
        });
      }
    }

    return Ok({ valid: true, message: "Permissions granted." });
  }

  addPolicies(policies: addPolicyOption) {
    for (const [subject, policy] of Object.entries(policies)) {
      const { allow, deny } = policy;

      if (allow) {
        for (const action of allow) {
          this.allow(subject as TSubjects, action);
        }
      }

      if (deny) {
        for (const action of deny) {
          this.deny(subject as TSubjects, action);
        }
      }

      if (!allow && !deny) {
        throw new Error("allow or deny option should be present");
      }
    }

    return this;
  }

  getPolicies() {
    return this.policy;
  }

  static normalizePermissionsMap(permissions: TPermission[]) {
    const permissionMap = new Map<TSubjects, TActions[]>();

    for (const permission of permissions) {
      const { subject, actions } = permission;
      const currentActions = permissionMap.get(subject) || [];

      permissionMap.set(subject, [...currentActions, ...actions]);
    }

    return permissionMap;
  }
}

// Example usage:
// const rbac = new RBAC();

// rbac.allow("billing", "create").allow("billing", "delete");
