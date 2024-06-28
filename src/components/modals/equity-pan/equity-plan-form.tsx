"use client";

import Tldr from "@/components/common/tldr";
import { popModal, pushModal } from "@/components/modals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import type { ShareClassMutationType } from "@/trpc/routers/share-class/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { RiAddFill } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";

import {
  EquityPlanMutationSchema,
  type EquityPlanMutationType,
} from "@/trpc/routers/equity-plan/schema";

import { LinearCombobox } from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = EquityPlanMutationSchema;

type EquityFormType = {
  type?: "create" | "update";
  className?: string;
  equityPlan?: EquityPlanMutationType;
  shareClasses: ShareClassMutationType[] | [];
};

export const EquityPlanForm = ({
  type = "create",
  shareClasses = [],
  equityPlan = {
    id: "",
    name: "",
    boardApprovalDate: new Date(),
    planEffectiveDate: null,
    initialSharesReserved: 0,
    defaultCancellatonBehavior: "RETURN_TO_POOL",
    shareClassId: "",
    comments: "",
  },
}: EquityFormType) => {
  const router = useRouter();

  const form = useForm<EquityPlanMutationType>({
    resolver: zodResolver(formSchema),
    defaultValues: equityPlan,
  });

  const isSubmitting = form.formState.isSubmitting;
  const createMutation = api.equityPlan.create.useMutation({
    onSuccess: ({ success, message }) => {
      if (success) {
        toast.success(message);
      } else {
        toast.error(message);
      }

      form.reset();
      popModal("EquityPlanModal");
      router.refresh();
    },
  });

  const updateMutation = api.equityPlan.update.useMutation({
    onSuccess: ({ success, message }) => {
      if (success) {
        toast.success(message);
      } else {
        toast.error(message);
      }

      form.reset();
      popModal("EquityPlanModal");
      router.refresh();
    },
  });

  const onSubmit = async (values: EquityPlanMutationType) => {
    type === "create"
      ? await createMutation.mutateAsync(values)
      : await updateMutation.mutateAsync(values);
  };

  const shareClassOpts = shareClasses.map((share) => ({
    value: share.id || "",
    label: share.name || "",
  }));

  const defaultCancellatonBehaviorOpts = [
    { value: "RETIRE", label: "Retire" },
    { value: "RETURN_TO_POOL", label: "Return to pool" },
    { value: "HOLD_AS_CAPITAL_STOCK", label: "Hold as capital stock" },
    { value: "DEFINED_PER_PLAN_SECURITY", label: "Defined per plan security" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6 md:col-span-2">
          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equity plan name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />
          </div>

          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="initialSharesReserved"
              render={({ field }) => {
                const { onChange, ...rest } = field;
                return (
                  <FormItem>
                    <FormLabel>Initial reserved shares</FormLabel>
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
              name="planEffectiveDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan effective date</FormLabel>
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
              name="shareClassId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select a share class</FormLabel>
                  <div>
                    {shareClasses.length > 0 ? (
                      <LinearCombobox
                        options={shareClassOpts}
                        onValueChange={(option) => field.onChange(option.value)}
                      >
                        <button
                          type="button"
                          className="cursor-pointer w-full text-left"
                          onClick={() => {
                            pushModal("ShareClassModal", {
                              shouldClientFetch: shareClasses.length === 0,
                              type: "create",
                              title: "Create a share class",
                              shareClasses,
                              subtitle: (
                                <Tldr
                                  message="A share class on a cap table represents a distinct category of shares with specific rights and characteristics, such as voting preferences or priorities. Eg. Common and Preferred shares, Class A, B, etc, ESOs and RSUs, etc."
                                  cta={{
                                    label: "Learn more",
                                    // TODO - this link should be updated to the correct URL
                                    href: "https://captable.inc/help",
                                  }}
                                />
                              ),
                            });
                          }}
                        >
                          <div className="flex justify-between items-center my-1">
                            <span>
                              <RiAddFill className="h-4 w-4" aria-hidden />
                            </span>

                            <div>Create new share class</div>
                          </div>
                        </button>
                      </LinearCombobox>
                    ) : (
                      <Button
                        className="mt-3"
                        size={"sm"}
                        variant={"outline"}
                        onClick={() => {
                          pushModal("ShareClassModal", {
                            shouldClientFetch: shareClasses.length === 0,
                            type: "create",
                            title: "Create a share class",
                            shareClasses,
                            subtitle: (
                              <Tldr
                                message="A share class on a cap table represents a distinct category of shares with specific rights and characteristics, such as voting preferences or priorities. Eg. Common and Preferred shares, Class A, B, etc, ESOs and RSUs, etc."
                                cta={{
                                  label: "Learn more",
                                  // TODO - this link should be updated to the correct URL
                                  href: "https://captable.inc/help",
                                }}
                              />
                            ),
                          });
                        }}
                      >
                        <RiAddFill className="mr-2 h-5 w-5" />
                        Create a share class
                      </Button>
                    )}
                  </div>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />
          </div>

          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="defaultCancellatonBehavior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default cancellation behavior</FormLabel>
                  <div>
                    <LinearCombobox
                      options={defaultCancellatonBehaviorOpts}
                      onValueChange={(option) => field.onChange(option.value)}
                    />
                  </div>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />
          </div>

          <div className="sm:col-span-6">
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />
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
                create: "Create equity plan",
                update: "Update equity plan",
              }[type]
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};
