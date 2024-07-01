"use client";

import Modal from "@/components/common/push-modal";
import {
  SingleStakeholderForm,
  type TStakeholder,
} from "./single-stake-holder-form";

type StakeholderType = {
  title: string | React.ReactNode;
  subtitle: string | React.ReactNode;
  stakeholder: TStakeholder;
};

export const UpdateSingleStakeholderModal = ({
  title,
  subtitle,
  stakeholder,
}: StakeholderType) => {
  return (
    <Modal size="2xl" title={title} subtitle={subtitle}>
      <SingleStakeholderForm type={"update"} stakeholder={stakeholder} />
    </Modal>
  );
};
