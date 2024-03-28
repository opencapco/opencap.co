import { type TypeZodAddFieldMutationSchema } from "@/trpc/routers/template-field-router/schema";
import { FieldRenderer } from "./field-renderer";
import { Button } from "@/components/ui/button";
import { SigningFieldForm } from "../signing-field-form";

type Field = TypeZodAddFieldMutationSchema["fields"][number];

interface SigningFieldsProps {
  fields: Field[];
  group: string;
  recipientId: string;
  templateId: string;
  companyPublicId: string | undefined;
}

export function SigningFields({
  fields,
  companyPublicId,
  group,
  recipientId,
  templateId,
}: SigningFieldsProps) {
  return (
    <SigningFieldForm
      group={group}
      recipientId={recipientId}
      templateId={templateId}
      companyPublicId={companyPublicId}
    >
      {fields.map((item) => (
        <FieldRenderer
          name={item.name}
          key={item.id}
          type={item.type}
          required={item.required}
          readOnly={item.readOnly}
        />
      ))}

      <Button type="submit">Sign</Button>
    </SigningFieldForm>
  );
}
