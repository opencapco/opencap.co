"use client";

import { pushModal } from "@/components/modals";
import type { TStakeholders } from "@/components/modals/issue-share-modal";
import type { TEquityPlans } from "@/components/modals/issue-stock-option-modal";
import { Button } from "@/components/ui/button";
import { RiAddFill } from "@remixicon/react";
import type React from "react";

type CreateShareClassButtonProps = {
  title: string;
  subtitle: string | React.ReactNode;
  equityPlans: TEquityPlans;
  stakeholders: TStakeholders;
  showButtonIcon: boolean;
  buttonDisplayName: string;
};

export const IssueStockOptionButton = ({
  title,
  subtitle,
  equityPlans,
  stakeholders,
  showButtonIcon,
  buttonDisplayName,
}: CreateShareClassButtonProps) => {
  console.log({ buttonDisplayName });
  return (
    <Button
      onClick={() => {
        pushModal("IssueStockOptionModal", {
          shouldClientFetch: false,
          title,
          subtitle,
          equityPlans,
          stakeholders,
        });
      }}
    >
      {showButtonIcon && <RiAddFill className="mr-2 h-5 w-5" />}
      {buttonDisplayName}
    </Button>
  );
};
