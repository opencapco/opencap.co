import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";
import {
  SecuritiesStatusEnum,
  ShareLegendsEnum,
  VestingScheduleEnum,
} from "@/prisma-enums";

export const ContributionDetailsField = [
  "capitalContribution",
  "ipContribution",
  "debtCancelled",
  "otherContributions",
];

export const ContributionDetails = () => {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <FormField
            control={form.control}
            name="capitalContribution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capital contribution</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage className="text-xs font-light" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex-1">
          <FormField
            control={form.control}
            name="ipContribution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intellectual property</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
            name="debtCancelled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Debt cancelled</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage className="text-xs font-light" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex-1">
          <FormField
            control={form.control}
            name="otherContributions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other contributions</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage className="text-xs font-light" />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
