import EmptyState from "@/components/common/empty-state";
import Tldr from "@/components/common/tldr";
import { Card } from "@/components/ui/card";
import { withServerSession } from "@/server/auth";
import { db } from "@/server/db";
import type { EquityPlanMutationType } from "@/trpc/routers/equity-plan/schema";
import type { ShareClassMutationType } from "@/trpc/routers/share-class/schema";
import { RiAddFill, RiPieChart2Line } from "@remixicon/react";
import type { Metadata } from "next";
import { CreateEquityPlanButton } from "./create-equity-plan-button";
import EquityPlanTable from "./table";

export const metadata: Metadata = {
  title: "Equity plans",
};

const getEquityPlans = async (companyId: string) => {
  return await db.equityPlan.findMany({
    where: { companyId },
  });
};

const getShareClasses = async (companyId: string) => {
  return await db.shareClass.findMany({
    where: { companyId },
  });
};

const EquityPlanPage = async () => {
  const session = await withServerSession();
  const companyId = session?.user?.companyId;
  let equityPlans: EquityPlanMutationType[] = [];

  if (companyId) {
    equityPlans = (await getEquityPlans(
      companyId,
    )) as unknown as EquityPlanMutationType[];
  }

  const shareClasses: ShareClassMutationType[] = (await getShareClasses(
    companyId,
  )) as unknown as ShareClassMutationType[];

  if (equityPlans.length === 0) {
    return (
      <EmptyState
        icon={<RiPieChart2Line />}
        title="You do not have any equity plans!"
        subtitle="Please click the button below to create a new equity plan."
      >
        <CreateEquityPlanButton
          type="create"
          title="Create an equity plan"
          shareClasses={shareClasses}
          subtitle={
            <Tldr
              message="Equity plans are used to distribute ownership of your company using stock options, RSUs, and other instruments among employees and stakeholders."
              cta={{
                label: "Learn more",
                // TODO - this link should be updated to the correct URL
                href: "https://captable.inc/help",
              }}
            />
          }
        />
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between gap-y-3 ">
        <div className="gap-y-3">
          <h3 className="font-medium">Equity plans</h3>
          <p className="text-sm text-muted-foreground">
            Manage the equity plans for your company
          </p>
        </div>

        <div>
          <CreateEquityPlanButton
            type="create"
            shareClasses={shareClasses}
            title="Create an equity plan"
            subtitle={
              <Tldr
                message="Equity plans are used to distribute ownership of your company using stock options, RSUs, and other instruments among employees and stakeholders."
                cta={{
                  label: "Learn more",
                  // TODO - this link should be updated to the correct URL
                  href: "https://captable.inc/help",
                }}
              />
            }
          />
        </div>
      </div>

      <Card className="mt-3">
        <div className="p-6">
          <EquityPlanTable
            equityPlans={equityPlans}
            shareClasses={shareClasses}
          />
        </div>
      </Card>
    </div>
  );
};

export default EquityPlanPage;
