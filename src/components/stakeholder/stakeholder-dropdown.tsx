"use client";

import Tldr from "@/components/common/tldr";
import { pushModal } from "@/components/modals";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiAccountCircleFill, RiAddFill, RiGroup2Fill } from "@remixicon/react";

export default function StakeholderDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button>
          <RiAddFill className="mr-2 h-5 w-5" />
          Add stakeholders
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <ul>
          <li>
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              onClick={() => {
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
              }}
            >
              <>
                <RiAccountCircleFill className="mr-2 h-4 w-4" />
                Add one stakeholder
              </>
            </Button>
          </li>

          <li>
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              onClick={() => {
                pushModal("MultipleStakeholdersModal", {
                  title: "Add or Import Stakeholders",
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
              }}
            >
              <>
                <RiGroup2Fill className="mr-2 h-4 w-4" />
                Import multiple stakeholders
              </>
            </Button>
          </li>
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
