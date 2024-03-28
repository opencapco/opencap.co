"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RiAddFill } from "@remixicon/react";
import { RiGroupLine } from "@remixicon/react";
import { RiUserLine } from "@remixicon/react";
import Tldr from "@/components/shared/tldr";
import MultipleStakeholdersModal from "@/components/stakeholder/multiple-stakeholders-modal";
import SingleStakeholdersModal from "@/components/stakeholder/single-stakeholder-modal";

export default function Single() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <RiAddFill className="mr-2 h-5 w-5" />
          Add stakeholders
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <SingleStakeholdersModal
            title="Add Stakeholder"
            subtitle={
              <Tldr
                message="Manage stakeholders by adding them. 
          Categorize, assign roles, and maintain contact info for investors, partners, and clients."
                cta={{
                  label: "Learn more",
                  // TODO - this link should be updated to the correct URL
                  href: "https://opencap.co/help",
                }}
              />
            }
            trigger={
              <div className="flex items-center">
                <RiUserLine className="mr-2 h-5 w-5" />
                Create one stakeholder
              </div>
            }
          />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <MultipleStakeholdersModal
            title="Add or Import Stakeholders"
            subtitle={
              <Tldr
                message="Manage stakeholders by adding or importing them. 
          Categorize, assign roles, and maintain contact info for investors, partners, and clients."
                cta={{
                  label: "Learn more",
                  // TODO - this link should be updated to the correct URL
                  href: "https://opencap.co/help",
                }}
              />
            }
            trigger={
              <div className="flex items-center">
                <RiGroupLine className="mr-2 h-5 w-5" />
                Import multiple stakeholders
              </div>
            }
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
