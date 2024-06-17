import { uploadFile } from "@/common/uploads";
import { Button } from "@/components/ui/button";
import {
  StepperModalContent,
  StepperModalFooter,
  StepperPrev,
  StepperStep,
} from "@/components/ui/stepper";
import { TAG } from "@/lib/tags";
import { useEsignValues } from "@/providers/esign-form-provider";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import {
  ManageEsignRecipientsForm,
  type TRecipientFormSchema,
} from "../../../modals/esign-recipients/manage-esign-recipients-form";

interface AddRecipientStepProps {
  companyPublicId: string;
}

export function AddRecipientStep({ companyPublicId }: AddRecipientStepProps) {
  const router = useRouter();
  const { value } = useEsignValues();
  const { mutateAsync: handleBucketUpload } = api.bucket.create.useMutation();
  const { mutateAsync: handleTemplateCreation } =
    api.template.create.useMutation();

  const onSubmit = async (data: TRecipientFormSchema) => {
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

    router.push(`/${companyPublicId}/documents/esign/${template.publicId}`);
  };

  return (
    <StepperStep className="flex flex-col gap-y-6" title="Add recipients">
      <StepperModalContent>
        <ManageEsignRecipientsForm onSubmit={onSubmit} isUpdate={false} />
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
