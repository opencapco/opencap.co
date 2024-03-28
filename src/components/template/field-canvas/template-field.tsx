import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RiAddCircleLine, RiCloseCircleLine } from "@remixicon/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemStyle,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import * as SelectPrimitive from "@radix-ui/react-select";
import { FieldTypeData } from "../field-type-data";

import { type TypeZodAddFieldMutationSchema } from "@/trpc/routers/template-field-router/schema";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { TemplateFieldContainer } from "./template-field-container";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { type TemplateFieldForm } from "@/providers/template-field-provider";

type Field = TypeZodAddFieldMutationSchema["fields"][number];

interface TemplateFieldProps {
  left: number;
  top: number;
  width: number;
  height: number;
  id: string;
  focusId: string;
  index: number;
  handleFocus: (id: string) => void;
  handleDelete: () => void;
  viewportWidth: number;
  viewportHeight: number;
  currentViewportWidth: number;
  currentViewportHeight: number;
}

export function TemplateField({
  height,
  left,
  top,
  width,
  id,
  focusId,
  handleFocus,
  index,
  handleDelete,
  currentViewportHeight,
  currentViewportWidth,
  viewportHeight,
  viewportWidth,
}: TemplateFieldProps) {
  const { control } = useFormContext<{ fields: Field[] }>();
  const type = useWatch({ control: control, name: `fields.${index}.type` });

  return (
    <TemplateFieldContainer
      className="overflow-visible"
      viewportWidth={viewportWidth}
      viewportHeight={viewportHeight}
      currentViewportWidth={currentViewportWidth}
      currentViewportHeight={currentViewportHeight}
      width={width}
      top={top}
      left={left}
      height={height}
      onClick={() => {
        handleFocus(id);
      }}
      role="button"
      tabIndex={0}
    >
      <div
        style={{ bottom: height }}
        className={cn(
          "absolute min-w-[300px] flex-col gap-y-2 border bg-white p-3 shadow-md",
          focusId === id ? "flex" : " hidden",
        )}
      >
        <div className="flex items-center gap-x-2">
          <Button
            className="mt-2"
            variant="ghost"
            size="sm"
            onClick={() => {
              handleDelete();
            }}
          >
            <RiCloseCircleLine className="h-5 w-5" />
          </Button>

          <FormField
            control={control}
            name={`fields.${index}.type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Field type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="trigger group h-8">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FieldTypeData.map((item) => (
                      <SelectItem key={item.label} value={item.value}>
                        <span className="flex items-center gap-x-2">
                          <item.icon className="h-4 w-4" aria-hidden />
                          <span className="group-[.trigger]:hidden">
                            {item.label}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`fields.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Field Name</FormLabel>
                <FormControl>
                  <Input
                    className="h-8 min-w-16"
                    type="text"
                    required
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FieldGroup index={index} />

        {type === "TEXT" && <FieldDefaultValue index={index} />}
      </div>
    </TemplateFieldContainer>
  );
}

interface FieldDefaultValueProps {
  index: number;
}

function FieldDefaultValue({ index }: FieldDefaultValueProps) {
  const { control } = useFormContext<{ fields: Field[] }>();

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1" className="border-b-0">
        <AccordionTrigger className="text-sm">
          Additional settings
        </AccordionTrigger>

        <AccordionContent>
          <div className="flex flex-col gap-y-2">
            <FormField
              control={control}
              name={`fields.${index}.defaultValue`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default value</FormLabel>
                  <FormControl>
                    <Input className="h-8 min-w-16" type="text" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`fields.${index}.readOnly`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="leading-none">
                    <FormLabel>Read only field</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function FieldGroupItems() {
  const { control } = useFormContext<TemplateFieldForm>();
  const groups = useWatch({ control, name: "groups" });

  return groups.map((item) => (
    <SelectItem key={item.name} value={item.name}>
      {item.name}
    </SelectItem>
  ));
}

interface FieldGroupProps {
  index: number;
}

const newGroupName = "add-new-group";

function FieldGroup({ index }: FieldGroupProps) {
  const { control } = useFormContext<TemplateFieldForm>();
  const { append, fields } = useFieldArray({
    name: "groups",
    control,
  });
  return (
    <FormField
      control={control}
      name={`fields.${index}.group`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Group</FormLabel>
          <Select
            onValueChange={(val) => {
              if (val === newGroupName) {
                append({
                  name: `Group ${fields.length + 1}`,
                });
              } else {
                field.onChange(val);
              }
            }}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a verified email to display" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <FieldGroupItems />
              <SelectSeparator />
              <SelectPrimitive.Item
                value={newGroupName}
                className={SelectItemStyle}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <RiAddCircleLine className="h-4 w-4" aria-hidden />
                </span>

                <SelectPrimitive.ItemText>
                  Add new group
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}
