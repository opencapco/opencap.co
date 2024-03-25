"use client";

import React from "react";
import {
  GeneralDetails,
  GeneralDetailsField,
  VestingDetails,
  VestingDetailsFields,
  RelevantDates,
  RelevantDatesFields,
  Documents,
} from "./steps";
import {
  type TypeZodAddOptionMutationSchema,
  ZodAddOptionMutationSchema,
} from "@/trpc/routers/securities-router/schema";
import { api } from "@/trpc/react";
import MultiStepFormModal from "@/components/shared/multistepFormModal";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

type OptionModalProps = {
  title: string;
  subtitle: string | React.ReactNode;
  trigger: string | React.ReactNode;
};

const OptionModal = ({ title, subtitle, trigger }: OptionModalProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const addOptionMutation = api.securities.addOptions.useMutation({
    onSuccess: async ({ message, success }) => {
      toast({
        variant: success ? "default" : "destructive",
        title: message,
        description: success
          ? "A new stakeholder option has been created."
          : "Failed adding an option. Please try again.",
      });
      if (success) {
        router.refresh();
      }
    },
  });

  const steps = [
    {
      id: 1,
      title: "General details",
      component: GeneralDetails,
      fields: GeneralDetailsField,
    },
    {
      id: 2,
      title: "Vesting details",
      component: VestingDetails,
      fields: VestingDetailsFields,
    },
    {
      id: 3,
      title: "Relevant dates",
      component: RelevantDates,
      fields: RelevantDatesFields,
    },
    {
      id: 4,
      title: "Documents",
      component: Documents,
      fields: ["documents"],
    },
  ];

  const onSubmit = async (data: TypeZodAddOptionMutationSchema) => {
    if (data?.documents.length === 0) {
      toast({
        variant: "destructive",
        title: "Uh ohh! Documents not found",
        description: "Please upload necessary documents",
      });
      return;
    }
    await addOptionMutation.mutateAsync(data);
  };
  return (
    <div>
      <MultiStepFormModal
        steps={steps}
        title={title}
        subtitle={subtitle}
        trigger={trigger}
        schema={ZodAddOptionMutationSchema}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default OptionModal;
