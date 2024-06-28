"use client";

import { FormValueProvider } from "@/providers/form-value-provider";
import { GeneralDetails } from "../safe/steps/general-details";
import { InvestorDetails } from "../safe/steps/investor-details";
import { SafeTemplate } from "../safe/steps/safe-template";
import {
  StepperModal,
  StepperModalContent,
  type StepperModalProps,
  StepperStep,
} from "../ui/stepper";

export function NewSafeModal(props: Omit<StepperModalProps, "children">) {
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

        <StepperStep title="Safe template">
          <StepperModalContent>
            <SafeTemplate />
          </StepperModalContent>
        </StepperStep>
      </FormValueProvider>
    </StepperModal>
  );
}
