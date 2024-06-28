"use client";

import Modal from "@/components/common/push-modal";
import StakeholderUploader from "../../stakeholder/stakeholder-uploader";

type StakeholderType = {
  title: string | React.ReactNode;
  subtitle: string | React.ReactNode;
};

export const MultipleStakeholdersModal = ({
  title,
  subtitle,
}: StakeholderType) => {
  return (
    <Modal size="xl" title={title} subtitle={subtitle}>
      <StakeholderUploader />
    </Modal>
  );
};
