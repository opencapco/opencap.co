"use client";

import Modal from "@/components/common/modal";
import Uploader, { type UploadReturn } from "@/components/ui/uploader";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DocumentUploadModalProps = {
  trigger: React.ReactNode;
  companyPublicId: string;
};

const DocumentUploadModal = ({
  trigger,
  companyPublicId,
}: DocumentUploadModalProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { mutateAsync } = api.document.create.useMutation();

  return (
    <Modal
      title="Upload a document"
      subtitle="Upload a document to your company's document library."
      trigger={trigger}
      dialogProps={{
        open,
        onOpenChange: (val) => {
          setOpen(val);
        },
      }}
    >
      <Uploader
        identifier={companyPublicId}
        keyPrefix="generic-document"
        onSuccess={async (uploadedData: UploadReturn) => {
          await mutateAsync({
            name: uploadedData.name,
            bucketId: uploadedData.id,
          });
          router.refresh();
          setOpen(false);
        }}
      />
    </Modal>
  );
};

export default DocumentUploadModal;
