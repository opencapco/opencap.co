"use client";

import Modal from "@/components/common/push-modal";
import { api } from "@/trpc/react";
import type { EquityPlanMutationType } from "@/trpc/routers/equity-plan/schema";
import type { ShareClassMutationType } from "@/trpc/routers/share-class/schema";
import { EquityPlanForm } from "./equity-plan-form";

type EquityPlanType = {
  type: "create" | "update";
  shouldClientFetch: boolean;
  title: string | React.ReactNode;
  subtitle: string | React.ReactNode;
  equityPlan?: EquityPlanMutationType;
  shareClasses: ShareClassMutationType[];
};

export const EquityPlanModal = ({
  type = "create",
  title,
  subtitle,
  equityPlan,
  shareClasses,
  shouldClientFetch,
}: EquityPlanType) => {
  const _shareClasses = api.shareClass.get.useQuery(undefined, {
    enabled: shouldClientFetch,
  }).data;

  const __shareClasses = shareClasses.length
    ? shareClasses
    : (_shareClasses as unknown as ShareClassMutationType[]);

  return (
    <Modal size="2xl" title={title} subtitle={subtitle}>
      <EquityPlanForm
        type={type}
        equityPlan={equityPlan}
        shareClasses={__shareClasses}
      />
    </Modal>
  );
};
