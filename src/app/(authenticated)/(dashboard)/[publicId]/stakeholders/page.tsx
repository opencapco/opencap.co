import { api } from "@/trpc/server";
import { Card } from "@/components/ui/card";
import EmptyState from "@/components/shared/empty-state";
import { RiGroup2Fill } from "@remixicon/react";
import StakeholderTable from "@/components/stakeholder/stakeholder-table";
import StakeholderDropdown from "@/components/stakeholder/stakeholder-dropdown";

const StakeholdersPage = async () => {
  const stakeholders = await api.stakeholder.getStakeholders.query();

  if (stakeholders.data.length === 0) {
    return (
      <EmptyState
        icon={<RiGroup2Fill />}
        title="You do not have any stakeholders!"
        subtitle="Please click the button below to add or import stakeholders."
      >
        <StakeholderDropdown />
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between gap-y-3">
        <div className="gap-y-3">
          <h3 className="font-medium">Stakeholders</h3>
          <p className="text-sm text-muted-foreground">
            Manage stakeholders for your company
          </p>
        </div>

        <div>
          <StakeholderDropdown />
        </div>
      </div>

      <Card className="mx-auto mt-3 w-[28rem] sm:w-[38rem] md:w-full">
        <StakeholderTable stakeholders={stakeholders.data} />
      </Card>
    </div>
  );
};

export default StakeholdersPage;
