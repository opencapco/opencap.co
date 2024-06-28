"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  ShareClassMutationSchema,
  type ShareClassMutationType,
} from "@/trpc/routers/share-class/schema";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { popModal } from "..";
import { type ComboBoxOption, LinearCombobox } from "../../ui/combobox";

const formSchema = ShareClassMutationSchema;

type ShareClassFormType = {
  type: "create" | "update";
  className?: string;
  shareClass?: ShareClassMutationType;
  shareClasses: ShareClassMutationType[];
};

const ShareClassForm = ({
  type,
  shareClasses,
  shareClass = {
    id: "",
    name: "",
    classType: "COMMON",
    initialSharesAuthorized: 0,
    boardApprovalDate: new Date(),
    stockholderApprovalDate: new Date(),
    votesPerShare: 0,
    parValue: 0,
    pricePerShare: 0,
    seniority: 0,
    conversionRights: "CONVERTS_TO_FUTURE_ROUND",
    convertsToShareClassId: "",
    liquidationPreferenceMultiple: 0,
    participationCapMultiple: 0,
  },
}: ShareClassFormType) => {
  const form = useForm<ShareClassMutationType>({
    resolver: zodResolver(formSchema),
    defaultValues: shareClass,
  });

  const { watch } = form;
  const router = useRouter();
  const isSubmitting = form.formState.isSubmitting;
  const watchConversionRights = watch("conversionRights") as string;
  const [renderShareClassInput, setRenderShareClassInput] = useState(false);
  const [defShareTypeOpt, setDefShareTypeOpt] = useState<ComboBoxOption>();
  useEffect(() => {
    if (watchConversionRights === "CONVERTS_TO_SHARE_CLASS_ID") {
      setRenderShareClassInput(true);
    } else {
      setRenderShareClassInput(false);
    }
  }, [watchConversionRights]);

  const createMutation = api.shareClass.create.useMutation({
    onSuccess: ({ success, message }) => {
      if (success) {
        toast.success(message);
        form.reset();
        popModal("ShareClassModal");
        router.refresh();
      } else {
        toast.error(message);
      }
    },
  });

  const updateMutation = api.shareClass.update.useMutation({
    onSuccess: ({ success, message }) => {
      if (success) {
        toast.success(message);
        form.reset();
        popModal("ShareClassModal");
        router.refresh();
      } else {
        toast.error(message);
      }
    },
  });

  const onSubmit = async (values: ShareClassMutationType) => {
    type === "create"
      ? await createMutation.mutateAsync(values)
      : await updateMutation.mutateAsync(values);
  };

  useEffect(() => {
    setDefShareTypeOpt(
      shareClassTypeOpts.find(
        (opt) => opt.value === form.getValues().classType,
      ),
    );
  }, [form.getValues]);

  const shareClassTypeOpts = [
    { value: "COMMON", label: "Common share" },
    { value: "PREFERRED", label: "Preferred share" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6 md:col-span-2">
          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Share class name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />
          </div>

          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="classType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of share class</FormLabel>
                  <div>
                    <LinearCombobox
                      options={shareClassTypeOpts}
                      onValueChange={(option) => field.onChange(option.value)}
                      defaultOption={defShareTypeOpt}
                    />
                  </div>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />
          </div>

          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="initialSharesAuthorized"
              render={({ field }) => {
                const { onChange, ...rest } = field;
                return (
                  <FormItem>
                    <FormLabel>Authorized shares</FormLabel>
                    <FormControl>
                      <NumericFormat
                        thousandSeparator
                        decimalScale={0}
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

          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="boardApprovalDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Board approval date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />
          </div>

          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="stockholderApprovalDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stockholder approval date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />
          </div>

          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="votesPerShare"
              render={({ field }) => {
                const { onChange, ...rest } = field;
                return (
                  <FormItem>
                    <FormLabel>Votes per share</FormLabel>
                    <FormControl>
                      <NumericFormat
                        thousandSeparator
                        allowedDecimalSeparators={["%"]}
                        decimalScale={2}
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

          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="parValue"
              render={({ field }) => {
                const { onChange, ...rest } = field;
                return (
                  <FormItem>
                    <FormLabel>Par value</FormLabel>
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

          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="pricePerShare"
              render={({ field }) => {
                const { onChange, ...rest } = field;
                return (
                  <FormItem>
                    <FormLabel>Price per share</FormLabel>
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

          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="seniority"
              render={({ field }) => {
                const { onChange, ...rest } = field;
                return (
                  <FormItem>
                    <FormLabel>Seniority</FormLabel>
                    <FormControl>
                      <NumericFormat
                        thousandSeparator
                        {...rest}
                        decimalScale={0}
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

          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="liquidationPreferenceMultiple"
              render={({ field }) => {
                const { onChange, ...rest } = field;
                return (
                  <FormItem>
                    <FormLabel>Liquidation preference multiple</FormLabel>
                    <FormControl>
                      <NumericFormat
                        thousandSeparator
                        allowedDecimalSeparators={["%"]}
                        decimalScale={2}
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

          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="participationCapMultiple"
              render={({ field }) => {
                const { onChange, ...rest } = field;
                return (
                  <FormItem>
                    <FormLabel>Participation cap multiple</FormLabel>
                    <FormControl>
                      <NumericFormat
                        thousandSeparator
                        allowedDecimalSeparators={["%"]}
                        decimalScale={2}
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

          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="conversionRights"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Conversion rights</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="CONVERTS_TO_FUTURE_ROUND" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Converts to future round
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="CONVERTS_TO_SHARE_CLASS_ID" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Converts to specific share class
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />
          </div>

          <div className="sm:col-span-3">
            {
              // if conversionRights === "CONVERTS_TO_SHARE_CLASS_ID"
              renderShareClassInput && (
                <div className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="convertsToShareClassId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Share class it{`'`}ll convert to</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value as string}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select existing share class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>
                                {shareClasses?.length > 0
                                  ? "Share classes"
                                  : "No share classes"}
                              </SelectLabel>

                              {shareClasses?.map((shareClass) => (
                                <SelectItem
                                  key={shareClass.id}
                                  value={shareClass.id as string}
                                >
                                  {shareClass.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs font-light" />
                      </FormItem>
                    )}
                  />
                </div>
              )
            }
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            loading={isSubmitting}
            loadingText="Submitting..."
            type="submit"
          >
            {
              {
                create: "Create share class",
                update: "Update share class",
              }[type]
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ShareClassForm;
