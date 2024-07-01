"use client";
import {
  type AddStakeholderMutationType,
  ZodAddStakeholderMutationSchema,
} from "@/trpc/routers/stakeholder-router/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { popModal } from "@/components/modals";
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
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/shared";
import { Label } from "@radix-ui/react-select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type TStakeholder =
  RouterOutputs["stakeholder"]["getStakeholders"][number];

type TSingleStakeholderForm =
  | {
      type: "create";
      stakeholder?: never;
    }
  | {
      type: "update";
      stakeholder: TStakeholder;
    };

export const SingleStakeholderForm = ({
  type,
  stakeholder,
}: TSingleStakeholderForm) => {
  const form = useForm<AddStakeholderMutationType>({
    defaultValues: {
      name: stakeholder?.name ?? "",
      email: stakeholder?.email ?? "",
      institutionName: stakeholder?.institutionName ?? "",
      stakeholderType: stakeholder?.stakeholderType,
      currentRelationship: stakeholder?.currentRelationship,
      taxId: stakeholder?.taxId ?? "",
      streetAddress: stakeholder?.streetAddress ?? "",
      city: stakeholder?.city ?? "",
      state: stakeholder?.state ?? "",
      zipcode: stakeholder?.zipcode ?? "",
    },
    resolver: zodResolver(ZodAddStakeholderMutationSchema),
  });

  const isSubmitting = form.formState.isSubmitting;
  const router = useRouter();

  const { mutateAsync: addStakeholderMutation } =
    api.stakeholder.addStakeholders.useMutation({
      onSuccess: ({ success, message }) => {
        if (success) {
          router.refresh();
          form.reset();
          toast.success("🎉 Successfully created!");
          popModal();
        } else {
          toast.error(`🔥 Error - ${message}`);
        }
      },
    });

  const { mutateAsync: updateStakeholderMutation } =
    api.stakeholder.updateStakeholder.useMutation({
      onSuccess: ({ success, message }) => {
        if (success) {
          router.refresh();
          form.reset();
          toast.success(message);
          popModal();
        } else {
          toast.error(`🔥 Error - ${message}`);
        }
      },
    });

  const onSubmit = async (values: AddStakeholderMutationType) => {
    console.log({ values }, "x");
    if (type === "update") {
      await updateStakeholderMutation({ ...values, id: stakeholder.id });
    } else {
      await addStakeholderMutation([values]);
    }
  };

  const stakeHolderTypeOpts = [
    { value: "INDIVIDUAL", label: "Individual" },
    { value: "INSTITUTION", label: "Institution" },
  ];

  const groupTypeOpts = [
    { value: "ADVISOR", label: "Advisor" },
    { value: "BOARD_MEMBER", label: "Board member" },
    { value: "CONSULTANT", label: "Consultant" },
    { value: "EMPLOYEE", label: "Employee" },
    { value: "EX_ADVISOR", label: "Ex advisor" },
    { value: "EX_CONSULTANT", label: "Ex consultant" },
    { value: "EX_EMPLOYEE", label: "Ex employee" },
    { value: "EXECUTIVE", label: "Executive" },
    { value: "FOUNDER", label: "Founder" },
    { value: "INVESTOR", label: "Investor" },
    { value: "NON_US_EMPLOYEE", label: "Non US employee" },
    { value: "OFFICER", label: "Officer" },
    { value: "OTHER", label: "Other" },
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
                  <FormLabel>Full name</FormLabel>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
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
              name="institutionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="stakeholderType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <div>
                    <LinearCombobox
                      defaultOption={{ value: field.value, label: field.value }}
                      options={stakeHolderTypeOpts}
                      onValueChange={(option) => {
                        field.onChange(option.value);
                      }}
                    />
                  </div>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />
          </div>
          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="currentRelationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group</FormLabel>
                  <div>
                    <LinearCombobox
                      defaultOption={{ value: field.value, label: field.value }}
                      options={groupTypeOpts}
                      onValueChange={(option) => field.onChange(option.value)}
                    />
                  </div>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />
          </div>
          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="sm:col-span-3">
            <FormField
              control={form.control}
              name="zipcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <Button
            disabled={type === "update" && !form.formState.isDirty}
            loading={isSubmitting}
            type="submit"
          >
            {type === "create"
              ? isSubmitting
                ? "Adding stakeholder"
                : "Add a stakeholder"
              : isSubmitting
                ? "Updating stakeholder"
                : "Update stakeholder"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
