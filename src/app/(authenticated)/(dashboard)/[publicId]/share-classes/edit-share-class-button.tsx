"use client";

import Tldr from "@/components/common/tldr";
import { pushModal } from "@/components/modals";
import type { ShareClassMutationType } from "@/trpc/routers/share-class/schema";
import { RiEqualizer2Line } from "@remixicon/react";

type EditShareClassButtonProps = {
  shareClasses?: ShareClassMutationType[];
  shareClass?: ShareClassMutationType;
};

export const EditShareClassButton = ({
  shareClasses,
  shareClass,
}: EditShareClassButtonProps) => {
  return (
    <RiEqualizer2Line
      className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700"
      onClick={() => {
        pushModal("ShareClassModal", {
          shouldClientFetch: false,
          type: "update",
          title: "Update share class",
          shareClass,
          shareClasses,
          subtitle: (
            <Tldr
              message="A share class on a cap table represents a distinct category of shares with specific rights and characteristics, such as voting preferences or priorities. Eg. Common and Preferred shares, Class A, B, etc, ESOs and RSUs, etc."
              cta={{
                label: "Learn more",
                href: "https://captable.inc/help",
              }}
            />
          ),
        });
      }}
    />
  );
};
