"use client";

import { GeneralDetails, GeneraLDetailsField } from "./steps";
import MultiStepFormModal from "@/components/shared/multistepFormModal";
import { ZodAddShareMutationSchema } from "@/trpc/routers/securities-router/schema";
import {
  ContributionDetails,
  ContributionDetailsField,
} from "./steps/contribution-details";
import { RelevantDates, RelevantDatesFields } from "./steps/relevant-dates";

type ShareModalProps = {
  title: string;
  subtitle: string | React.ReactNode;
  trigger: string | React.ReactNode;
};

const ShareModal = ({ title, subtitle, trigger }: ShareModalProps) => {
  const steps = [
    {
      id: 1,
      title: "General details",
      component: GeneralDetails,
      fields: GeneraLDetailsField,
    },
    {
      id: 2,
      title: "Contribution details",
      component: ContributionDetails,
      fields: ContributionDetailsField,
    },
    {
      id: 3,
      title: "Relevant dates",
      component: RelevantDates,
      fields: RelevantDatesFields,
    },
  ];

  const onSubmit = (data: any) => {
    console.log({ data });
  };

  return (
    <div>
      <MultiStepFormModal
        steps={steps}
        title={title}
        subtitle={subtitle}
        trigger={trigger}
        schema={ZodAddShareMutationSchema}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default ShareModal;
