import { describe, expect, test } from "vitest";
import { RBAC, type addPolicyOption } from ".";
import type { TPermission } from "./schema";

describe("evaluating a query", () => {
  const testCases: {
    name: string;
    policies: addPolicyOption;
    permissions: TPermission[];
    valid: boolean;
  }[] = [
    {
      name: "role check - pass",
      valid: true,
      permissions: [{ subject: "billing", actions: ["read"] }],
      policies: { billing: { allow: ["read"] } },
    },
    {
      name: "role check - fail",
      valid: false,
      permissions: [{ subject: "billing", actions: ["read"] }],
      policies: { billing: { allow: ["update"] } },
    },
    {
      name: "check deny",
      valid: false,
      permissions: [{ subject: "billing", actions: ["read", "update"] }],
      policies: { billing: { allow: ["read"], deny: ["update"] } },
    },
    {
      name: "multiple permissions - pass",
      valid: true,
      permissions: [
        { subject: "billing", actions: ["read", "update", "delete"] },
        { subject: "invite", actions: ["read", "update"] },
      ],
      policies: {
        billing: { allow: ["read", "update"] },
        invite: { allow: ["read"] },
      },
    },
    {
      name: "multiple permissions - fail",
      valid: false,
      permissions: [
        { subject: "billing", actions: ["read", "update", "delete"] },
        { subject: "invite", actions: ["read", "update"] },
      ],
      policies: {
        billing: { allow: ["read", "update"] },
        invite: { allow: ["delete"] },
      },
    },
    {
      name: "role check wild card - pass",
      valid: true,
      permissions: [{ subject: "billing", actions: ["*"] }],
      policies: { billing: { allow: ["read"] } },
    },
    {
      name: "should pass on empty policies",
      valid: true,
      permissions: [{ subject: "billing", actions: ["*"] }],
      policies: {},
    },
  ];

  for (const tc of testCases) {
    test(tc.name, () => {
      const res = new RBAC().addPolicies(tc.policies).enforce(tc.permissions);
      expect(res.err).toBeUndefined();
      expect(res.val?.valid).toBe(tc.valid);
    });
  }
});
