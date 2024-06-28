import {
  StepperModalContent,
  StepperStep,
  useStepper,
} from "@/components/ui/stepper";
import Uploader from "@/components/ui/uploader";
import { useEsignValues } from "@/providers/esign-form-provider";

export function UploadDocumentStep() {
  const { next } = useStepper();
  const { setValue } = useEsignValues();

  return (
    <StepperStep title="Upload a document">
      <StepperModalContent>
        <Uploader
          shouldUpload={false}
          onSuccess={(file) => {
            setValue({ document: file });
            next();
          }}
          accept={{
            "application/pdf": [".pdf"],
          }}
        />
      </StepperModalContent>
    </StepperStep>
  );
}
