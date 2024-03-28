"use client";

import { Button } from "@/components/ui/button";
import * as Toolbar from "@radix-ui/react-toolbar";
import { type FieldTypes } from "@/prisma-enums";
import { FieldTypeData } from "../field-type-data";

import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { type TemplateFieldForm } from "@/providers/template-field-provider";
import { RecepientModal } from "./recepient-modal";

interface CanvasToolbarProps {
  templatePublicId: string;
}

export function CanvasToolbar({ templatePublicId }: CanvasToolbarProps) {
  const { control } = useFormContext<TemplateFieldForm>();

  return (
    <div className="relative z-30 col-span-12 mb-20">
      <Toolbar.Root
        className="fixed top-14 flex w-full max-w-[74.4%] items-center justify-between rounded-b-md bg-white p-2 shadow-lg"
        aria-label="Formatting options"
      >
        <FormField
          name="fieldType"
          control={control}
          render={({ field }) => (
            <Toolbar.ToggleGroup
              onValueChange={(value) => {
                field.onChange(value as FieldTypes);
              }}
              value={field.value}
              className="flex gap-x-2"
              type="single"
            >
              {FieldTypeData.map((item) => (
                <Toolbar.ToggleItem key={item.value} value={item.value} asChild>
                  <Button
                    aria-label={item.label}
                    className="flex h-auto flex-col gap-y-1 data-[state=on]:bg-accent"
                    variant="ghost"
                  >
                    <span>
                      <item.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="text-xs">{item.label}</span>
                  </Button>
                </Toolbar.ToggleItem>
              ))}
            </Toolbar.ToggleGroup>
          )}
        />

        <RecepientModal templatePublicId={templatePublicId} />
      </Toolbar.Root>
    </div>
  );
}
