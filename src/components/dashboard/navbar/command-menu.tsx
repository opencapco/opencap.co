"use client";

import {
  type RemixiconComponentType,
  RiAccountCircleFill,
  RiPieChart2Fill,
  RiSparklingFill,
  RiUploadCloud2Fill,
} from "@remixicon/react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { Button } from "@/components/ui/button";
import Kbd from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { RiSearchLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Tldr from "@/components/common/tldr";
import { pushModal } from "@/components/modals";

type CommandOption = {
  id: string;
  title: string;
  path?: string;
  icon: RemixiconComponentType;
  onClick?: (publicId: string) => void;
};

const Pages: CommandOption[] = [
  {
    id: "ai",
    title: "Ask an AI",
    path: "/ai",
    icon: RiSparklingFill,
  },
  {
    id: "stakeholders",
    title: "Add a stakeholder",
    icon: RiAccountCircleFill,
    onClick: () => {
      pushModal("SingleStakeholdersModal", {
        title: "Add a stakeholder",
        subtitle: (
          <Tldr
            message="Manage stakeholders by adding them. 
          Categorize, assign roles, and maintain contact info for investors, partners, and clients."
            cta={{
              label: "Learn more",
              href: "https://captable.inc/help",
            }}
          />
        ),
      });
    },
  },
  {
    id: "documents",
    title: "Upload document",
    icon: RiUploadCloud2Fill,
    onClick: (companyPublicId: string) => {
      pushModal("DocumentUploadModal", {
        companyPublicId,
      });
    },
  },
  {
    id: "esign-document",
    title: "Upload esign document",
    icon: RiUploadCloud2Fill,
    onClick: (companyPublicId: string) => {
      pushModal("AddEsignDocumentModal", {
        title: "eSign a Document",
        subtitle: "",
        companyPublicId,
      });
    },
  },
  {
    id: "equity-plan",
    title: "Create an equity plan",
    icon: RiPieChart2Fill,
    onClick: () => {
      pushModal("EquityPlanModal", {
        shouldClientFetch: true,
        type: "create",
        title: "Create an equity plan",
        shareClasses: [],
        subtitle: (
          <Tldr
            message="Equity plans are used to distribute ownership of your company using stock options, RSUs, and other instruments among employees and stakeholders."
            cta={{
              label: "Learn more",
              // TODO - this link should be updated to the correct URL
              href: "https://captable.inc/help",
            }}
          />
        ),
      });
    },
  },
  {
    id: "share-class",
    title: "Create a share class",
    icon: RiPieChart2Fill,
    onClick: () => {
      pushModal("ShareClassModal", {
        shouldClientFetch: true,
        type: "create",
        title: "Create a share class",
        shareClasses: [],
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
    },
  },
  {
    id: "issue-share",
    title: "Issue a share",
    onClick: () => {
      pushModal("IssueShareModal", {
        shouldClientFetch: true,
        title: "Create a share",
        subtitle: "Please fill in the details to create and issue a share.",
        stakeholders: [],
        shareClasses: [],
      });
    },
    icon: RiPieChart2Fill,
  },
  {
    id: "issue-stock-option",
    title: "Issue a stock option",
    onClick: () => {
      pushModal("IssueStockOptionModal", {
        shouldClientFetch: true,
        title: "Create an option",
        subtitle: "Please fill in the details to create an option.",
        stakeholders: [],
        equityPlans: [],
      });
    },
    icon: RiPieChart2Fill,
  },
  {
    id: "new-safe",
    title: "Create a new SAFE",
    onClick: () => {
      pushModal("NewSafeModal", {
        title: "Create a new SAFE agreement",
        subtitle:
          "Create, sign and send a new SAFE agreement to your investors.",
      });
    },
    icon: RiPieChart2Fill,
  },
  {
    id: "existing-safe",
    title: "Create an existing SAFE agreement",
    onClick: () => {
      pushModal("ExistingSafeModal", {
        title: "Create an existing SAFE agreement",
        subtitle:
          "Record an existing SAFE agreement to keep track of it in your captable.",
      });
    },
    icon: RiPieChart2Fill,
  },
];

type CommandMenuProps = {
  companyPublicId: string;
};
export function CommandMenu({ companyPublicId }: CommandMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const push = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <div className={cn("ml-8 hidden flex-1 gap-x-6 md:flex md:justify-center")}>
      <Button
        variant="outline"
        className="flex w-80 items-center justify-between rounded text-muted-foreground"
        onClick={() => setOpen((s) => !s)}
      >
        <div className="flex items-center">
          <RiSearchLine className="mr-2 h-5 w-5" />
          <span>Type a command or search</span>
        </div>
        <Kbd>
          <span className="text-sm">⌘</span> + K
        </Kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList className="no-scrollbar">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {Pages.map((page) => (
              <CommandItem
                key={page.id}
                onSelect={() => {
                  if (page.path) {
                    push(page.path);
                  } else {
                    if (page.onClick) {
                      setOpen(false);
                      if (
                        page.id === "documents" ||
                        page.id === "esign-document"
                      ) {
                        page.onClick(companyPublicId);
                      } else {
                        page.onClick("");
                      }
                    }
                  }
                }}
                className=""
              >
                <div
                  className={cn(
                    "rounded-lg p-0.5",
                    page.id === "ai" ? "bg-teal-100" : "bg-gray-200",
                  )}
                >
                  {page.id === "ai" ? (
                    <page.icon
                      className="h-4 w-4 p-0.5 text-teal-600"
                      aria-hidden="true"
                    />
                  ) : (
                    <page.icon
                      className="h-4 w-4 p-0.5 text-primary"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <span className="ml-2">{page.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
