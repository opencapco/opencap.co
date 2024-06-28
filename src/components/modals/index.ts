"use client";

import { DocumentUploadModal } from "./document-upload-modal";
import { EquityPlanModal } from "./equity-pan/equity-plan-modal";
import { ExistingSafeModal } from "./existing-safe-modal";
import { IssueShareModal } from "./issue-share-modal";
import { IssueStockOptionModal } from "./issue-stock-option-modal";
import { NewSafeModal } from "./new-safe-modal";
import { ShareClassModal } from "./share-class/share-class-modal";
import { ShareDataRoomModal } from "./share-dataroom-modal";
import { ShareUpdateModal } from "./share-update-modal";
import { MultipleStakeholdersModal } from "./stakeholder/multiple-stakeholders-modal";
import { SingleStakeholdersModal } from "./stakeholder/single-stake-holder-modal";
import { TeamMemberModal } from "./team-member/team-member-modal";
import { WipModal } from "./wip-modal";

import { createPushModal } from "pushmodal";
import { AddEsignDocumentModal } from "./esign-doc";

export const { pushModal, popModal, ModalProvider } = createPushModal({
  modals: {
    WipModal,
    ShareClassModal,
    TeamMemberModal,
    ShareUpdateModal,
    ShareDataRoomModal,
    SingleStakeholdersModal,
    MultipleStakeholdersModal,
    DocumentUploadModal,
    EquityPlanModal,
    IssueShareModal,
    IssueStockOptionModal,
    NewSafeModal,
    ExistingSafeModal,
    AddEsignDocumentModal,
  },
});
