"use client";

import Modal from "@/components/shared/modal";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type TemplateFieldForm } from "@/providers/template-field-provider";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { RiDeleteBinLine } from "@remixicon/react";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

function RecepientGroupItems() {
  const { control } = useFormContext<TemplateFieldForm>();
  const fields = useWatch({ control, name: "fields" });
  const groups = new Set(fields.map((item) => item.group));

  return Array.from(groups).map((item) => (
    <SelectItem key={item} value={item}>
      {item}
    </SelectItem>
  ));
}

interface RecepientGroupProps {
  index: number;
}

function RecepientGroup({ index }: RecepientGroupProps) {
  const { control } = useFormContext<TemplateFieldForm>();
  return (
    <FormField
      control={control}
      name={`recipients.${index}.group`}
      render={({ field }) => (
        <FormItem className="flex-shrink-0">
          <FormLabel>Group</FormLabel>
          <Select required onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <RecepientGroupItems />
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}

interface RecepientModalProps {
  templatePublicId: string;
}

export function RecepientModal({ templatePublicId }: RecepientModalProps) {
  const router = useRouter();
  const { control, handleSubmit } = useFormContext<TemplateFieldForm>();
  const { fields, append, remove } = useFieldArray({
    name: "recipients",
    control,
  });

  const { toast } = useToast();

  const { mutateAsync } = api.templateField.add.useMutation({
    onSuccess: () => {
      toast({
        variant: "default",
        title: "🎉 Successfully created",
        description: "Your template fields has been created.",
      });
      router.push("/");
    },
  });

  const onSubmit = async ({
    fields,
    recipients,
    orderedDelivery,
  }: TemplateFieldForm) => {
    await mutateAsync({
      templatePublicId,
      fields,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      recipients: recipients as any,
      orderedDelivery,
    });
  };

  const isDeleteDisabled = fields.length === 1;
  return (
    <Modal size="2xl" title="Add recepients" trigger={<Button>Save</Button>}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-col">
            {fields.map((item, index) => (
              <div className="flex items-end justify-between" key={item.id}>
                <div className="flex items-center gap-x-2">
                  <FormField
                    control={control}
                    name={`recipients.${index}.email`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            className="h-8 min-w-16"
                            type="email"
                            required
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`recipients.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            className="h-8 min-w-16"
                            type="text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <RecepientGroup index={index} />
                </div>

                <div className="flex items-center">
                  <Button
                    disabled={isDeleteDisabled}
                    onClick={() => {
                      remove(index);
                    }}
                    variant="outline"
                  >
                    <RiDeleteBinLine aria-hidden className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <FormField
              control={control}
              name="orderedDelivery"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="leading-none">
                    <FormLabel>Ordered delivery</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div>
            <Button
              type="button"
              onClick={() => {
                append({ email: "", name: "", group: undefined });
              }}
            >
              Add recepient
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    </Modal>
  );
}
