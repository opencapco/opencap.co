"use client";

import {
  StepperModal,
  StepperModalContent,
  type StepperModalProps,
  StepperStep,
} from "@/components/ui/stepper";
import { StockOptionFormProvider } from "@/providers/stock-option-form-provider";

import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/shared";
import { Documents } from "../securities/options/steps/documents";
import { GeneralDetails } from "../securities/options/steps/general-details";
import { RelevantDates } from "../securities/options/steps/relevant-dates";
import { VestingDetails } from "../securities/options/steps/vesting-details";
import type { TStakeholders } from "./issue-share-modal";

export type TEquityPlans = RouterOutputs["equityPlan"]["getPlans"]["data"];

type VestingDetailsProps = {
  stakeholders: TStakeholders;
  equityPlans: TEquityPlans;
};

function VestingDetailsStep({
  stakeholders,
  equityPlans,
}: VestingDetailsProps) {
  return (
    <VestingDetails stakeholders={stakeholders} equityPlans={equityPlans} />
  );
}

type IssueStockOptionModalProps = Omit<StepperModalProps, "children"> & {
  shouldClientFetch: boolean;
  equityPlans: TEquityPlans | [];
  stakeholders: TStakeholders | [];
};

export const IssueStockOptionModal = ({
  shouldClientFetch,
  equityPlans,
  stakeholders,
  ...rest
}: IssueStockOptionModalProps) => {
  const _stakeholders = api.stakeholder.getStakeholders.useQuery(undefined, {
    enabled: shouldClientFetch,
  }).data;

  const _equityPlans = api.equityPlan.getPlans.useQuery(undefined, {
    enabled: shouldClientFetch,
  }).data?.data;

  const __stakeholders = stakeholders.length
    ? stakeholders
    : (_stakeholders as unknown as TStakeholders);
  const __equityPlans = equityPlans.length
    ? equityPlans
    : (_equityPlans as unknown as TEquityPlans);

  return (
    <StepperModal {...rest}>
      <StockOptionFormProvider>
        <StepperStep title="General details">
          <StepperModalContent>
            <GeneralDetails />
          </StepperModalContent>
        </StepperStep>
        <StepperStep title="Vesting details">
          <StepperModalContent>
            <VestingDetailsStep
              stakeholders={__stakeholders}
              equityPlans={__equityPlans}
            />
          </StepperModalContent>
        </StepperStep>
        <StepperStep title="Relevant dates">
          <StepperModalContent>
            <RelevantDates />
          </StepperModalContent>
        </StepperStep>
        <StepperStep title="Documents">
          <StepperModalContent>
            <Documents />
          </StepperModalContent>
        </StepperStep>
      </StockOptionFormProvider>
    </StepperModal>
  );
};
