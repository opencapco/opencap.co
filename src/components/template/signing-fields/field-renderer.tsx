/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SignaturePad } from "@/components/ui/signature-pad";
import { type TemplateSigningFieldForm } from "@/providers/template-signing-field-provider";
import { type TypeZodAddFieldMutationSchema } from "@/trpc/routers/template-field-router/schema";
import { useFormContext } from "react-hook-form";

type FieldRendererProps = Pick<
  TypeZodAddFieldMutationSchema["fields"][number],
  "type" | "name" | "required" | "readOnly"
>;

export function FieldRenderer({
  type,
  name,
  required,
  readOnly,
}: FieldRendererProps) {
  const { control } = useFormContext<TemplateSigningFieldForm>();

  switch (type) {
    case "TEXT":
      return (
        <FormField
          control={control}
          rules={{
            required: {
              message: "this field is required",
              value: required,
            },
          }}
          name={`fieldValues.${name}` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{name}</FormLabel>
              <FormControl>
                <Input disabled={readOnly} type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "SIGNATURE":
      return (
        <FormField
          control={control}
          rules={{
            required: {
              message: "signature is required",
              value: required,
            },
          }}
          name={`fieldValues.${name}` as const}
          render={({ field: { onChange } }) => (
            <FormItem>
              <FormLabel>{name}</FormLabel>
              <FormControl>
                <SignaturePad
                  onChange={(val) => {
                    onChange(val);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    default:
      return null;
  }
}
