import { uploadFile } from "@/common/uploads";
import { popModal } from "@/components/modals";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  StepperModalContent,
  StepperModalFooter,
  StepperPrev,
  StepperStep,
} from "@/components/ui/stepper";
import { TAG } from "@/lib/tags";
import { useEsignValues } from "@/providers/esign-form-provider";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { RiDeleteBinLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  recipients: z.array(
    z.object({
      email: z.string().email(),
      name: z.string().optional(),
    }),
  ),
  orderedDelivery: z.boolean(),
});

type TFormSchema = z.infer<typeof FormSchema>;

interface AddRecipientStepProps {
  companyPublicId: string;
}

export function AddRecipientStep({ companyPublicId }: AddRecipientStepProps) {
  const router = useRouter();

  const { value } = useEsignValues();
  const { mutateAsync: handleBucketUpload } = api.bucket.create.useMutation();
  const { mutateAsync: handleTemplateCreation } =
    api.template.create.useMutation();

  const form = useForm<TFormSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      orderedDelivery: false,
      recipients: [{ email: "", name: "" }],
    },
  });

  const { append, fields, remove } = useFieldArray({
    control: form.control,
    name: "recipients",
  });

  const onSubmit = async (data: TFormSchema) => {
    const document = value?.document?.[0];
    if (!document) {
      throw new Error("no document found to upload");
    }
    const { key, mimeType, name, size } = await uploadFile(document, {
      identifier: companyPublicId,
      keyPrefix: "unsigned-esign-doc",
    });

    const { id: bucketId, name: templateName } = await handleBucketUpload({
      key,
      mimeType,
      name,
      size,
      tags: [TAG.ESIGN],
    });

    const template = await handleTemplateCreation({
      bucketId,
      name: templateName,
      ...data,
    });

    popModal("AddEsignDocumentModal");

    router.push(`/${companyPublicId}/documents/esign/${template.publicId}`);
  };

  const isDeleteDisabled = fields.length === 1;

  return (
    <StepperStep className="flex flex-col gap-y-6" title="Add recipients">
      <StepperModalContent>
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
                      {fields.length > 1 && (
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
                ))}
              </div>

              <div>
                <FormField
                  control={form.control}
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
                        <FormLabel>
                          Require recipients to sign in the order they are added
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <Button
                  type="button"
                  variant={"secondary"}
                  size="sm"
                  onClick={() => {
                    append({ email: "", name: "" });
                  }}
                >
                  Add more recipient
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </StepperModalContent>
      <StepperModalFooter>
        <StepperPrev>Back</StepperPrev>
        <Button type="submit" form="recipient-form">
          Save & Continue
        </Button>
      </StepperModalFooter>
    </StepperStep>
  );
}
