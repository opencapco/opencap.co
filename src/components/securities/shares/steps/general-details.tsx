import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";
import {
  SecuritiesStatusEnum,
  ShareLegendsEnum,
  VestingScheduleEnum,
} from "@/prisma-enums";

export const GeneraLDetailsField = [
  "certificateId",
  "status",
  "quantity",
  "pricePerShare",
  "vestingSchedule",
  "companyLegends",
];

export const GeneralDetails = () => {
  const form = useFormContext();

  const status = useMemo(
    () =>
      Object.values(SecuritiesStatusEnum).filter(
        (value) => typeof value === "string",
      ),
    [],
  ) as string[];

  const vestingSchedule = useMemo(
    () =>
      Object.values(VestingScheduleEnum).filter(
        (value) => typeof value === "string",
      ),
    [],
  ) as string[];

  const companyLegends = useMemo(
    () =>
      Object.values(ShareLegendsEnum).filter(
        (value) => typeof value === "string",
      ),
    [],
  ) as string[];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <FormField
            control={form.control}
            name="certificateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificate ID</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage className="text-xs font-light" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex-1">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {status
                      ? status.map((s, index) => (
                          <SelectItem key={index} value={s}>
                            {s}
                          </SelectItem>
                        ))
                      : null}
                  </SelectContent>
                </Select>
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
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
            name="pricePerShare"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per share</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage className="text-xs font-light" />
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={form.control}
        name="vestingSchedule"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vesting schedule</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Vesting" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {vestingSchedule?.length &&
                  vestingSchedule.map((vs, index) => (
                    <SelectItem key={index} value={vs}>
                      {vs}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-xs font-light" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="companyLegends"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company legends</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select company legends" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {companyLegends?.length &&
                  companyLegends.map((cl, index) => (
                    <SelectItem key={index} value={cl}>
                      {cl}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-xs font-light" />
          </FormItem>
        )}
      />
    </div>
  );
};
