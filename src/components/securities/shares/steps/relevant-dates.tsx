"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { useFormContext } from "react-hook-form";

export const RelevantDatesFields = [
  "issueDate",
  "vestingStartDate",
  "boardApprovalDate",
  "rule144Date",
];

export const RelevantDates = () => {
  const form = useFormContext();

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="vestingStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vesting start date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="boardApprovalDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Board approval date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="rule144Date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule 144 date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-light" />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </>
  );
};
