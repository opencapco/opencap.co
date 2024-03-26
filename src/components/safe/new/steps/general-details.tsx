import React from 'react'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { SafeTemplateEnum } from '@/prisma-enums';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export const GeneralDetailsFields =
    [
        "safeId",
        "safeTemplate",
        "valuationCap",
        "discountRate",
        "proRata"
    ];

export const GeneralDetails = () => {
    const form = useFormContext();

    return (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="safeId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Safe ID</FormLabel>
                        <FormControl>
                            <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs font-light" />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="safeTemplate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Safe template</FormLabel>
                        {/* eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment */}
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {
                                    //eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment
                                    Object.entries(SafeTemplateEnum).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>
                                            {value}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                        <FormMessage className="text-xs font-light" />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="valuationCap"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Valuation cap</FormLabel>
                        <FormControl>
                            <Input
                                type={"text"}
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                        </FormControl>
                        <FormMessage className="text-xs font-light" />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="discountRate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Discount rate</FormLabel>
                        <FormControl>
                            {/* eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment */}
                            <Input type="text" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                        </FormControl>
                        <FormMessage className="text-xs font-light" />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="proRata"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            {/* eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment */}
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className='space-y-1 leading-none'>
                            Pro-rata rights
                        </FormLabel>
                    </FormItem>
                )}
            />
        </div>
    )
};
