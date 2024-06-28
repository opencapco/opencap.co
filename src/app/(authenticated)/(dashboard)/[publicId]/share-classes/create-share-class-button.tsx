"use client";

import Tldr from "@/components/common/tldr";
import { pushModal } from "@/components/modals";
import { Button } from "@/components/ui/button";
import type { ShareClassMutationType } from "@/trpc/routers/share-class/schema";
import { RiAddFill } from "@remixicon/react";

type CreateShareClassButtonProps = {
  shareClasses: ShareClassMutationType[];
};

export const CreateShareButton = ({
  shareClasses,
}: CreateShareClassButtonProps) => {
  return (
    <Button
      onClick={() => {
        pushModal("ShareClassModal", {
          type: "create",
          shouldClientFetch: false,
          title: "Create a share class",
          shareClasses,
          subtitle: (
            <Tldr
              message="A share class on a cap table represents a distinct category of shares with specific rights and characteristics, such as voting preferences or priorities. Eg. Common and Preferred shares, Class A, B, etc, ESOs and RSUs, etc."
              cta={{
                label: "Learn more",
                // TODO - this link should be updated to the correct URL
                href: "https://captable.inc/help",
              }}
            />
          ),
        });
      }}
    >
      <RiAddFill className="mr-2 h-5 w-5" />
      Create a share class
    </Button>
  );
};
