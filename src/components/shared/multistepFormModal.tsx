"use client";

import { RiCheckLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/modal";
import { useState } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export type stepsType = {
  id: number;
  title: string;
  fields: string[];
  component: () => JSX.Element;
};

type MultiStepFormModalType = {
  title: string | React.ReactNode;
  subtitle: string | React.ReactNode;
  trigger: React.ReactNode;
  steps: stepsType[];
  schema: z.AnyZodObject;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: SubmitHandler<any>;
};

export default function MultiStepFormModal({
  title,
  subtitle,
  trigger,
  steps,
  schema,
  onSubmit,
}: MultiStepFormModalType) {
  const [open, setOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);

  const methods = useForm<FormField>({ resolver: zodResolver(schema) });

  type FormField = z.infer<typeof schema>;
  type FieldName = keyof FormField;

  const StepForm = steps[formStep - 1]!.component;

  const nextStep = async () => {
    const fields = steps[formStep - 1]?.fields ?? [];

    const output = await methods.trigger(fields as FieldName[] as string[], {
      shouldFocus: true,
    });
    if (!output) return;

    try {
      if (formStep < steps.length) {
        setFormStep(formStep + 1);
      } else {
        await methods.handleSubmit(onSubmit)();
        methods.reset();
        setOpen(false);
      }
    } catch (error) {
      setOpen(true);
    }
  };

  const prevStep = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);
    }
  };

  return (
    <Modal
      size="3xl"
      title={title}
      subtitle={subtitle}
      trigger={trigger}
      dialogProps={{ open, onOpenChange: (val) => setOpen(val) }}
    >
      <div className="grid grid-cols-10">
        <nav aria-label="Progress" className="red col-span-3 max-w-64">
          <ol role="list" className="overflow-hidden">
            {steps.map((step, stepIdx) => (
              <li
                key={step.title}
                className={`${stepIdx !== steps.length - 1 ? "pb-10" : ""} relative`}
              >
                {step.id < formStep ? (
                  <>
                    {stepIdx !== steps.length - 1 ? (
                      <div
                        className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-teal-600"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="group relative flex items-center">
                      <span className="flex h-9 items-center">
                        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 group-hover:bg-teal-800">
                          <RiCheckLine
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />
                        </span>
                      </span>
                      <span className="ml-4 flex min-w-0 flex-col">
                        <span className="text-sm font-medium">
                          {step.title}
                        </span>
                      </span>
                    </span>
                  </>
                ) : step.id === formStep ? (
                  <>
                    {stepIdx !== steps.length - 1 ? (
                      <div
                        className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span
                      className="group relative flex items-center"
                      aria-current="step"
                    >
                      <span
                        className="flex h-9 items-center"
                        aria-hidden="true"
                      >
                        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-teal-600 bg-white">
                          <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                        </span>
                      </span>
                      <span className="ml-4 flex min-w-0 flex-col">
                        <span className="text-sm font-medium text-teal-600">
                          {step.title}
                        </span>
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    {stepIdx !== steps.length - 1 ? (
                      <div
                        className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="group relative flex items-center">
                      <span
                        className="flex h-9 items-center"
                        aria-hidden="true"
                      >
                        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                          <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
                        </span>
                      </span>
                      <span className="ml-4 flex min-w-0 flex-col">
                        <span className="text-sm font-medium text-gray-500">
                          {step.title}
                        </span>
                      </span>
                    </span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="col-span-7 space-y-6">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <div className="w-full border p-4">
                <h5 className="text-lg font-semibold">
                  {steps[formStep - 1]?.title}
                </h5>
                <div className="mt-4">
                  <StepForm />
                </div>
              </div>
            </form>
          </FormProvider>
          <div className="flex justify-end">
            <div className="space-x-4">
              {formStep > 1 && (
                <Button variant={"outline"} onClick={prevStep}>
                  Back
                </Button>
              )}

              <Button type="submit" onClick={nextStep}>
                {formStep < steps.length ? "Continue" : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
