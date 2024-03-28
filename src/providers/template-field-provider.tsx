"use client";

import { Form } from "@/components/ui/form";
import { type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { type TypeZodAddFieldMutationSchema } from "@/trpc/routers/template-field-router/schema";
import { type FieldTypes } from "@/prisma-enums";

type Field = TypeZodAddFieldMutationSchema["fields"][number];

interface TemplateFieldProviderProps {
  children: ReactNode;
  fields?: Field[];
}

export type TemplateFieldForm = {
  fields: Field[];
  fieldType: FieldTypes | undefined;
  recipients: { name: string; email: string; group: string | undefined }[];
  orderedDelivery: boolean;
  groups: { name: string }[];
};

const group1 = "Group 1";
const group2 = "Group 2";

export const DEFAULT_GROUP = [{ name: group1 }, { name: group2 }];

export const TemplateFieldProvider = ({
  children,
  fields,
}: TemplateFieldProviderProps) => {
  const form = useForm<TemplateFieldForm>({
    defaultValues: {
      fields: fields ?? [],
      fieldType: undefined,
      recipients: [{ name: "", email: "", group: undefined }],
      orderedDelivery: false,
      groups: DEFAULT_GROUP,
    },
  });

  return <Form {...form}>{children}</Form>;
};
