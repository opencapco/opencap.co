"use client";

import Modal from "@/components/common/push-modal";
import {
  AddRecipientsForm,
  type TRecipientFormSchema,
} from "@/components/esign/add-esign-modal/steps/add-recipient-form";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type RecipientSelectorModalProps = {
  title: string | React.ReactNode;
  subtitle: string | React.ReactNode;
  templateId: string;
  defaultValues: TRecipientFormSchema;
};

export const ManageEsignRecipientsModal = ({
  title,
  subtitle,
  templateId,
  defaultValues,
}: RecipientSelectorModalProps) => {
  const router = useRouter();

  const { data: recipients, refetch: refetchRecipients } =
    api.template.getRecipients.useQuery({ templateId });

  const { mutateAsync: toggleOrderedDelivery } =
    api.template.toggleOrderedDelivery.useMutation({
      onSuccess: ({ success, message }) => {
        if (success) {
          toast.success(message);
          refetchRecipients();
          router.refresh();
        }
      },
    });

  const { mutateAsync: deleteRecipientMutation } =
    api.template.removeRecipient.useMutation({
      onSuccess: ({ success, message }) => {
        if (success) {
          toast.success(message);
          refetchRecipients();
          router.refresh();
        }
      },
    });

  const { mutateAsync: addRecipientMutation } =
    api.template.addRecipient.useMutation({
      onSuccess: ({ success, message }) => {
        if (success) {
          toast.success(message);
          refetchRecipients();
          router.refresh();
        }
      },
    });

  return (
    <Modal size="2xl" title={title} subtitle={subtitle}>
      <AddRecipientsForm
        onSubmit={() => {}}
        isUpdate={true}
        recipientsPayload={recipients}
        defaultValues={defaultValues}
        onSave={async ({ recipient }) => {
          await addRecipientMutation({
            recipient,
            templateId,
          });
        }}
        onDelete={async ({ recipientId }) => {
          await deleteRecipientMutation({ recipientId });
        }}
        onToggleOrderedDelivery={async (newStatus, setLoading) => {
          await toggleOrderedDelivery({
            orderedDelivery: newStatus,
            templateId,
          });
          setLoading(false);
        }}
      />
    </Modal>
  );
};
