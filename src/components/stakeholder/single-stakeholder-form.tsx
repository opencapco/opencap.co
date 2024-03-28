"use client";
import {
  ZodAddStakeholderMutationSchema,
  type AddStakeholderMutationType,
} from "@/trpc/routers/stakeholder-router/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
type SingleStakeholderFormType = {
  setOpen: (val: boolean) => void;
};

const SingleStakeholderForm = ({ setOpen }: SingleStakeholderFormType) => {
  const form = useForm<AddStakeholderMutationType>({
    resolver: zodResolver(ZodAddStakeholderMutationSchema),
  });

  const isSubmitting = form.formState.isSubmitting;
  const router = useRouter();

  const { mutateAsync } = api.stakeholder.addStakeholders.useMutation({
    onSuccess: async ({ success, message }) => {
      toast({
        variant: success ? "default" : "destructive",
        title: success
          ? "🎉 Successfully created"
          : "Uh oh! Something went wrong.",
        description: message,
      });

      router.refresh();
    },
  });

  const onSubmit = async (values: AddStakeholderMutationType) => {
    await mutateAsync([values]);
    setOpen(false);
  };
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
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                      <SelectItem value="INSTITUTION">Institution</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <FormLabel>Association</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select association" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADVISOR">Advisor</SelectItem>
                      <SelectItem value="BOARD_MEMBER">Board member</SelectItem>
                      <SelectItem value="CONSULTANT">Consultant</SelectItem>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="EX_ADVISOR">Ex advisor</SelectItem>
                      <SelectItem value="EX_CONSULTANT">
                        Ex consultant
                      </SelectItem>
                      <SelectItem value="EX_EMPLOYEE">Ex employee</SelectItem>
                      <SelectItem value="EXECUTIVE">Executive</SelectItem>
                      <SelectItem value="FOUNDER">Founder</SelectItem>
                      <SelectItem value="INVESTOR">Investor</SelectItem>
                      <SelectItem value="NON_US_EMPLOYEE">
                        Non uS employee
                      </SelectItem>
                      <SelectItem value="OFFICER">Officer</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
          <Button loading={isSubmitting} type="submit">
            {isSubmitting ? "Adding..." : "Add"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SingleStakeholderForm;
