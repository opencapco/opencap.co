"use client";

import { Button } from "@/components/ui/button";
import { LinearCombobox } from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  StepperModalFooter,
  StepperPrev,
  useStepper,
} from "@/components/ui/stepper";
import { useAddShareFormValues } from "@/providers/add-share-form-provider";
import type { RouterOutputs } from "@/trpc/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { z } from "zod";
import { EmptySelect } from "../../shared/EmptySelect";

interface ContributionDetailsProps {
  stakeholders: RouterOutputs["stakeholder"]["getStakeholders"] | [];
}

const formSchema = z.object({
  stakeholderId: z.string(),
  capitalContribution: z.coerce.number().min(0),
  ipContribution: z.coerce.number().min(0),
  debtCancelled: z.coerce.number().min(0),
  otherContributions: z.coerce.number().min(0),
});

type TFormSchema = z.infer<typeof formSchema>;

export const ContributionDetails = ({
  stakeholders = [],
}: ContributionDetailsProps) => {
  const form = useForm<TFormSchema>({ resolver: zodResolver(formSchema) });
  const { next } = useStepper();
  const { setValue } = useAddShareFormValues();

  const handleSubmit = (data: TFormSchema) => {
    console.log({ data });
    setValue(data);
    next();
  };

  const stakeHoldersOpts = stakeholders.map((stakeHolder) => ({
    value: stakeHolder.id,
    label: `${stakeHolder.company.name} - ${stakeHolder.name}`,
  }));

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-y-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="stakeholderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stakeholder</FormLabel>
                {/* eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment */}
                <div>
                  <LinearCombobox
                    options={stakeHoldersOpts}
                    onValueChange={(option) => field.onChange(option.value)}
                  />
                </div>
                <FormMessage className="text-xs font-light" />
              </FormItem>
            )}
          />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="capitalContribution"
                render={({ field }) => {
                  const { onChange, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Contributed capital amount</FormLabel>
                      <FormControl>
                        <NumericFormat
                          thousandSeparator
                          allowedDecimalSeparators={["%"]}
                          decimalScale={2}
                          prefix={"$  "}
                          {...rest}
                          customInput={Input}
                          onValueChange={(values) => {
                            const { floatValue } = values;
                            onChange(floatValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-light" />
                    </FormItem>
                  );
                }}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="ipContribution"
                render={({ field }) => {
                  const { onChange, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Value of intellectual property</FormLabel>
                      <FormControl>
                        <NumericFormat
                          thousandSeparator
                          allowedDecimalSeparators={["%"]}
                          decimalScale={2}
                          prefix={"$  "}
                          {...rest}
                          customInput={Input}
                          onValueChange={(values) => {
                            const { floatValue } = values;
                            onChange(floatValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-light" />
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="debtCancelled"
                render={({ field }) => {
                  const { onChange, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Debt cancelled amount</FormLabel>
                      <FormControl>
                        <NumericFormat
                          thousandSeparator
                          allowedDecimalSeparators={["%"]}
                          decimalScale={2}
                          prefix={"$  "}
                          {...rest}
                          customInput={Input}
                          onValueChange={(values) => {
                            const { floatValue } = values;
                            onChange(floatValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-light" />
                    </FormItem>
                  );
                }}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="otherContributions"
                render={({ field }) => {
                  const { onChange, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Other contributed amount</FormLabel>
                      <FormControl>
                        <NumericFormat
                          thousandSeparator
                          allowedDecimalSeparators={["%"]}
                          decimalScale={2}
                          prefix={"$  "}
                          {...rest}
                          customInput={Input}
                          onValueChange={(values) => {
                            const { floatValue } = values;
                            onChange(floatValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-light" />
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>
        </div>
        <StepperModalFooter>
          <StepperPrev>Back</StepperPrev>
          <Button type="submit">Save & Continue</Button>
        </StepperModalFooter>
      </form>
    </Form>
  );
};
