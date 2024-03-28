"use client";

import { Form } from "@/components/ui/form";
import { type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { type TypeZodAddFieldMutationSchema } from "@/trpc/routers/template-field-router/schema";

type Field = TypeZodAddFieldMutationSchema["fields"][number];

interface TemplateSigningFieldProviderProps {
  children: ReactNode;
  fields?: Field[];
}

export type TemplateSigningFieldForm = {
  fields: Field[];
  fieldValues: Record<string, string>;
};

export const TemplateSigningFieldProvider = ({
  children,
  fields,
}: TemplateSigningFieldProviderProps) => {
  const form = useForm<TemplateSigningFieldForm>({
    defaultValues: {
      fields: fields ?? [],
      fieldValues: fields
        ? fields.reduce<Record<string, string>>((prev, curr) => {
            prev[curr.name] = curr?.defaultValue ?? "";
            return prev;
          }, {})
        : {},
    },
  });

  return <Form {...form}>{children}</Form>;
};
