import EmptyState from "@/components/common/empty-state";
import Tldr from "@/components/common/tldr";
import OptionTable from "@/components/securities/options/option-table";
import { Card } from "@/components/ui/card";
import { api } from "@/trpc/server";
import { RiGroup2Fill } from "@remixicon/react";
import type { Metadata } from "next";
import { IssueStockOptionButton } from "./issue-stock-option-button";

export const metadata: Metadata = {
  title: "Options",
};

const OptionsPage = async () => {
  const options = await api.securities.getOptions.query();
  const stakeholders = await api.stakeholder.getStakeholders.query();
  const equityPlans = await api.equityPlan.getPlans.query();

  if (options?.data?.length === 0) {
    return (
      <EmptyState
        icon={<RiGroup2Fill />}
        title="You have not issued any stock options yet."
        subtitle="Please click the button below to start issueing options."
      >
        <IssueStockOptionButton
          showButtonIcon={true}
          buttonDisplayName="Issue a stock option"
          title="Create an option"
          subtitle="Please fill in the details to create an option."
          equityPlans={equityPlans.data}
          stakeholders={stakeholders}
        />
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between gap-y-3 ">
        <div className="gap-y-3">
          <h3 className="font-medium">Options</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add stock options for stakeholders
          </p>
        </div>
        <div>
          <IssueStockOptionButton
            showButtonIcon={false}
            buttonDisplayName="Add Options"
            title="Collect options for Stakeholders"
            subtitle={
              <Tldr
                message="Manage stock options by adding them. 
             Add approval dates, notes, grantId for the stakeholders. "
                cta={{
                  label: "Learn more",
                  href: "https://captable.inc/help/stakeholder-options",
                }}
              />
            }
            equityPlans={equityPlans.data}
            stakeholders={stakeholders}
          />
        </div>
      </div>
      <Card className="mx-auto mt-3 w-[28rem] sm:w-[38rem] md:w-full">
        <OptionTable options={options.data} />
      </Card>
    </div>
  );
};

export default OptionsPage;
