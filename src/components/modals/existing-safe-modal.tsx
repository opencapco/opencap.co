"use client";

import { FormValueProvider } from "@/providers/form-value-provider";
import { GeneralDetails } from "../safe/steps/general-details";
import { InvestorDetails } from "../safe/steps/investor-details";
import { SafeDocuments } from "../safe/steps/safe-documents";
import {
  StepperModal,
  StepperModalContent,
  type StepperModalProps,
  StepperStep,
} from "../ui/stepper";

export function ExistingSafeModal(props: Omit<StepperModalProps, "children">) {
  return (
    <StepperModal {...props}>
      <FormValueProvider>
        <StepperStep title="General details">
          <StepperModalContent>
            <GeneralDetails />
          </StepperModalContent>
        </StepperStep>

        <StepperStep title="Investor details">
          <StepperModalContent>
            <InvestorDetails />
          </StepperModalContent>
        </StepperStep>

        <StepperStep title="Documents">
          <StepperModalContent>
            <SafeDocuments />
          </StepperModalContent>
        </StepperStep>
      </FormValueProvider>
    </StepperModal>
  );
}
