"use client";

import Modal from "@/components/common/push-modal";

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ManageEsignRecipientsForm,
  type TRecipientFormSchema,
} from "./manage-esign-recipients-form";

type ManageEsignRecipientsModalProps = {
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
}: ManageEsignRecipientsModalProps) => {
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
      <ManageEsignRecipientsForm
        isUpdate={true}
        recipientsPayload={recipients}
        defaultValues={defaultValues}
        onSubmit={() => {}}
        onSave={async ({ recipient, setLoading }) => {
          setLoading(true);
          await addRecipientMutation({
            recipient,
            templateId,
          });
          setLoading(false);
        }}
        onDelete={async ({ recipientId, setLoading }) => {
          setLoading(true);
          await deleteRecipientMutation({ recipientId });
          setLoading(false);
        }}
        onToggleOrderedDelivery={async (
          newStatusValue,
          handleCheck,
          setLoading,
        ) => {
          setLoading(true);
          const { success } = await toggleOrderedDelivery({
            orderedDelivery: newStatusValue,
            templateId,
          });
          if (success) {
            handleCheck(newStatusValue);
          }
          setLoading(false);
        }}
      />
    </Modal>
  );
};
