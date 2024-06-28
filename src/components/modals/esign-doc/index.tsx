"use client";

import { StepperModal } from "@/components/ui/stepper";
import { EsignFormProvider } from "@/providers/esign-form-provider";
import { AddRecipientStep } from "./steps/add-recepients-step";
import { UploadDocumentStep } from "./steps/upload-document-step";

interface AddEsignDocumentModalProps {
  title: string;
  subtitle: string | React.ReactNode;
  companyPublicId: string;
}

export function AddEsignDocumentModal({
  companyPublicId,
  title,
  subtitle,
}: AddEsignDocumentModalProps) {
  return (
    <StepperModal size={"4xl"} title={title} subtitle={subtitle}>
      <EsignFormProvider>
        <UploadDocumentStep />
        <AddRecipientStep companyPublicId={companyPublicId} />
      </EsignFormProvider>
    </StepperModal>
  );
}
