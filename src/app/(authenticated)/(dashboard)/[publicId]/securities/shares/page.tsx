import EmptyState from "@/components/common/empty-state";
import { ShareModal } from "@/components/securities/shares/share-modal";
import ShareTable from "@/components/securities/shares/share-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/trpc/server";
import { RiAddFill, RiPieChartFill } from "@remixicon/react";
import type { Metadata } from "next";
import { IssueShareButton } from "./issue-share-button";

export const metadata: Metadata = {
  title: "Captable | Shares",
};

const SharesPage = async () => {
  const shares = await api.securities.getShares.query();
  const stakeholders = await api.stakeholder.getStakeholders.query();
  const shareClasses = await api.shareClass.get.query();

  if (shares?.data?.length === 0) {
    return (
      <EmptyState
        icon={<RiPieChartFill />}
        title="You have not issued any shares"
        subtitle="Please click the button below to start issuing shares."
      >
        <IssueShareButton
          title="Create a share"
          subtitle="Please fill in the details to create and issue a share."
          stakeholders={stakeholders}
          shareClasses={shareClasses}
        />
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between gap-y-3 ">
        <div className="gap-y-3">
          <h3 className="font-medium">Shares</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Issue shares to stakeholders
          </p>
        </div>
        <div>
          <IssueShareButton
            title="Create a share"
            subtitle="Please fill in the details to create and issue a share."
            stakeholders={stakeholders}
            shareClasses={shareClasses}
          />
        </div>
      </div>
      <Card className="mx-auto mt-3 w-[28rem] sm:w-[38rem] md:w-full">
        <ShareTable shares={shares.data} />
      </Card>
    </div>
  );
};

export default SharesPage;
