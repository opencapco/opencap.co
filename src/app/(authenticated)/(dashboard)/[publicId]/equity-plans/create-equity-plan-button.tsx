"use client";

import { pushModal } from "@/components/modals";
import { Button } from "@/components/ui/button";
import { EquityPlanMutationType } from "@/trpc/routers/equity-plan/schema";
import type { ShareClassMutationType } from "@/trpc/routers/share-class/schema";
import { RiAddFill } from "@remixicon/react";
import type React from "react";

type CreateEquityPlanButtonProps = {
  type: "create" | "update";
  title: string;
  subtitle: string | React.ReactNode;
  shareClasses: ShareClassMutationType[];
};

export const CreateEquityPlanButton = ({
  title,
  subtitle,
  shareClasses,
}: CreateEquityPlanButtonProps) => {
  return (
    <Button
      onClick={() => {
        pushModal("EquityPlanModal", {
          shouldClientFetch: false,
          title,
          subtitle,
          shareClasses,
          type: "create",
        });
      }}
    >
      <RiAddFill className="mr-2 h-5 w-5" />
      Create an equity plan
    </Button>
  );
};
