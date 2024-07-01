"use client";

import { createPushModal } from "pushmodal";
import { ManageEsignRecipientsModal } from "./esign-recipients/manage-esign-recipients-modal";
import { ShareClassModal } from "./share-class-modal";
import { ShareDataRoomModal } from "./share-dataroom-modal";
import { ShareUpdateModal } from "./share-update-modal";
import { SingleStakeholdersModal } from "./stakeholder/single-stake-holder-modal";
import { TeamMemberModal } from "./team-member/team-member-modal";
import { WipModal } from "./wip-modal";

export const { pushModal, popModal, ModalProvider } = createPushModal({
  modals: {
    WipModal,
    ShareClassModal,
    TeamMemberModal,
    SingleStakeholdersModal,
    ShareUpdateModal,
    ShareDataRoomModal,
    ManageEsignRecipientsModal,
  },
});
