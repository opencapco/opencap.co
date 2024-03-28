"use client";

import { useState } from "react";
import Modal from "@/components/shared/modal";
import StakeholderUploader from "./stakeholder-uploader";

type StakeholderType = {
  title: string | React.ReactNode;
  subtitle: string | React.ReactNode;
  trigger: React.ReactNode;
};

const MultipleStakeholdersModal = ({
  title,
  subtitle,
  trigger,
}: StakeholderType) => {
  const [open, setOpen] = useState(false);

  return (
    <Modal
      size="xl"
      title={title}
      subtitle={subtitle}
      trigger={trigger}
      dialogProps={{
        open,
        onOpenChange: (val) => {
          setOpen(val);
        },
      }}
    >
      <StakeholderUploader setOpen={setOpen} />
    </Modal>
  );
};

export default MultipleStakeholdersModal;
