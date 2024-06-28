"use client";

import Modal from "@/components/common/push-modal";
import Uploader, { type UploadReturn } from "@/components/ui/uploader";
import { TAG } from "@/lib/tags";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

type DocumentUploadModalProps = {
  companyPublicId: string;
};

export const DocumentUploadModal = ({
  companyPublicId,
}: DocumentUploadModalProps) => {
  const router = useRouter();

  const { mutateAsync } = api.document.create.useMutation();

  return (
    <Modal
      title="Upload a document"
      subtitle="Upload a document to your company's document library."
    >
      <Uploader
        shouldUpload={true}
        identifier={companyPublicId}
        keyPrefix="generic-documents"
        tags={[TAG.GENERIC]}
        onSuccess={async (uploadedData: UploadReturn) => {
          await mutateAsync({
            name: uploadedData.name,
            bucketId: uploadedData.id,
          });

          router.refresh();
        }}
      />
    </Modal>
  );
};
