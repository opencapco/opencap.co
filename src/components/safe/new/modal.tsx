import { useState } from "react";
import { api } from "@/trpc/react";
import MultiStepModal from "@/components/shared/multistep-modal";
import { useRouter } from "next/navigation";
import useSafeSteps from "./useSafeSteps";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import {
  type SafeMutationType,
  SafeMutationSchema,
} from "@/trpc/routers/safe/schema";

type CreateNewSafeType = {
  companyId: string;
  trigger: React.ReactNode;
};

export default function CreateNewSafe({
  companyId,
  trigger,
}: CreateNewSafeType) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const steps = useSafeSteps({ companyId });
  const formSchema = SafeMutationSchema;
  const { toast } = useToast();

  const { mutateAsync } = api.safe.create.useMutation({
    onSuccess: (payload) => {
      const isSuccess = payload?.success;
      const message = payload?.message;
      toast({
        variant: isSuccess ? "default" : "destructive",
        title: isSuccess ? "🎉 Success" : "Failed creating safe",
        description: message,
      });
      if (isSuccess) {
        router.push(
          `/${session?.user.companyPublicId}/templates/${payload?.document?.publicId}`,
        );
      }
      setOpen(false);
    },
  });

  const onSubmit = async (values: SafeMutationType) => {
    if (values.safeTemplate !== "CUSTOM") {
      await mutateAsync(values);
    }
    if (
      values.safeTemplate === "CUSTOM" &&
      values?.documents?.length === 1 &&
      values?.documents[0]?.bucketId &&
      values?.documents[0]?.name
    ) {
      await mutateAsync(values);
    }
  };

  return (
    <MultiStepModal
      title="Create a new SAFE agreement"
      subtitle="Create, sign and send a new SAFE agreement to your investors."
      trigger={trigger}
      steps={steps}
      schema={formSchema}
      onSubmit={onSubmit}
      dialogProps={{ open, onOpenChange: setOpen }}
    />
  );
}
