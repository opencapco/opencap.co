import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import Loading from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { RouterOutputs } from "@/trpc/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { RiDeleteBinLine } from "@remixicon/react";
import type React from "react";
import { type SetStateAction, useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const FormSchema = z.object({
  recipients: z.array(
    z.object({
      id: z.string().optional(),
      email: z.string().email(),
      name: z.string().optional(),
    }),
  ),
  orderedDelivery: z.boolean(),
});
export type TRecipientFormSchema = z.infer<typeof FormSchema>;

export type OnDelete = {
  recipientId: string;
  email: string;
};
export type OnSave = {
  recipient: {
    name: string;
    email: string;
  };
};
type RecipientsPayload = RouterOutputs["template"]["getRecipients"];
type SubmitProps =
  | {
      isUpdate: false;
      onSubmit: (data: TRecipientFormSchema) => void;
    }
  | {
      isUpdate: true;
      onSubmit: () => void;
    };

type ManageEsignRecipientsFormProps = SubmitProps & {
  onSave?: (data: OnSave) => void;
  onDelete?: (data: OnDelete) => void;
  onToggleOrderedDelivery?: (
    newStatus: boolean,
    set: React.Dispatch<SetStateAction<boolean>>,
  ) => void;
  defaultValues?: TRecipientFormSchema;
  recipientsPayload?: RecipientsPayload;
};

export const ManageEsignRecipientsForm = ({
  isUpdate,
  onSubmit,
  onSave,
  onDelete,
  onToggleOrderedDelivery,
  defaultValues,
  recipientsPayload,
}: ManageEsignRecipientsFormProps) => {
  const effectRanCount = useRef<number>(0);
  const [canAddMoreRecipient, setCanAdd] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<TRecipientFormSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      recipients: defaultValues?.recipients.length
        ? defaultValues.recipients
        : [{ name: "", email: "", id: "" }],
      orderedDelivery: isUpdate
        ? recipientsPayload?.orderedDelivery ?? defaultValues?.orderedDelivery
        : false,
    },
  });

  const { append, fields, remove } = useFieldArray({
    control: form.control,
    name: "recipients",
  });

  const isDeleteDisabled = fields.length === 1;

  // biome-ignore lint/correctness/useExhaustiveDependencies: its-fine
  useEffect(() => {
    if (recipientsPayload?.recipients?.length) {
      form.reset(recipientsPayload as TRecipientFormSchema);
      if (isUpdate) {
        setCanAdd(true);
      }
    }
  }, [recipientsPayload?.recipients]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: its-fine
  useEffect(() => {
    if (effectRanCount.current > 1 && onToggleOrderedDelivery) {
      setLoading(true);
      onToggleOrderedDelivery(form.getValues("orderedDelivery"), setLoading);
    }
    effectRanCount.current += 1;
  }, [form.getValues("orderedDelivery")]);

  function getRecipientIdByEmail(email: string) {
    const recipients = form.getValues("recipients");
    const targetRecipient = recipients.filter((recp) => recp.email === email);
    return targetRecipient[0]?.id ?? "";
  }

  function getNewRecipient() {
    return form.getValues("recipients")[
      form.getValues("recipients").length - 1
    ];
  }

  function getNewRecipientName() {
    return getNewRecipient()?.name;
  }

  function getNewRecipientEmail() {
    return getNewRecipient()?.email;
  }

  return (
    <Form {...form}>
      <form id="recipient-form" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-col">
            {fields.map((item, index) => (
              <div
                className="my-3 flex items-end justify-between gap-x-2"
                key={item.id}
              >
                <div className="flex items-center gap-x-10">
                  <FormField
                    control={form.control}
                    name={`recipients.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            disabled={!!getRecipientIdByEmail(item.email)}
                            className="h-8 min-w-16"
                            type="text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`recipients.${index}.email`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            disabled={!!getRecipientIdByEmail(item.email)}
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
                </div>

                <div className="flex items-center">
                  <div className="flex items-center space-x-5">
                    {isUpdate && !getRecipientIdByEmail(item.email) && (
                      <Button
                        type="submit"
                        variant={"outline"}
                        size="sm"
                        onClick={() => {
                          if (onSave) {
                            if (!getNewRecipientEmail()) {
                              toast.error("Email must be present");
                            }
                            console.log("SAVING...");
                            onSave({
                              recipient: {
                                name: getNewRecipientName() ?? "",
                                email: getNewRecipientEmail() as string,
                              },
                            });
                          }
                        }}
                      >
                        Save
                      </Button>
                    )}

                    {isUpdate && (
                      <Button
                        onClick={() => {
                          if (onDelete && getRecipientIdByEmail(item.email)) {
                            onDelete({
                              recipientId: getRecipientIdByEmail(item.email),
                              email: item.email,
                            });
                          } else {
                            remove(index);
                            setCanAdd(true);
                          }
                        }}
                        variant="ghost"
                        size="sm"
                        className="group h-8 w-8 p-2"
                      >
                        <RiDeleteBinLine
                          aria-hidden
                          className="h-8 w-8 text-red-500/70 group-hover:text-red-500"
                        />
                      </Button>
                    )}

                    {!isUpdate && fields.length > 1 && (
                      <Button
                        disabled={isDeleteDisabled}
                        onClick={() => {
                          remove(index);
                        }}
                        variant="ghost"
                        size="sm"
                        className="group h-8 w-8 p-2"
                      >
                        <RiDeleteBinLine
                          aria-hidden
                          className="h-8 w-8 text-red-500/70 group-hover:text-red-500"
                        />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full">
            <FormField
              control={form.control}
              name="orderedDelivery"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    {loading ? (
                      <Loading />
                    ) : (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  </FormControl>
                  <div className="leading-none w-full flex justify-between item-center ">
                    <FormLabel>
                      Require recipients to sign in the order they are added
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between items-center my-2">
            <Button
              disabled={!canAddMoreRecipient}
              type="button"
              variant={isUpdate ? "default" : "outline"}
              size="sm"
              onClick={() => {
                append({ email: "", name: "", id: "" });
                if (isUpdate) {
                  setCanAdd(false);
                }
              }}
            >
              Add more recipient
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
