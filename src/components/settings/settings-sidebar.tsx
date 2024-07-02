"use client";

import { NavLink } from "@/components/dashboard/sidebar/nav-link";
import {
  RiAccountCircleFill,
  RiAccountCircleLine,
  RiBankCardFill,
  RiBankCardLine,
  RiBuildingFill,
  RiBuildingLine,
  RiGroup2Fill,
  RiGroup2Line,
  RiLock2Fill,
  RiLock2Line,
  RiNotificationFill,
  RiNotificationLine,
  RiShieldUserFill,
  RiShieldUserLine,
  RiTerminalBoxFill,
  RiTerminalBoxLine,
} from "@remixicon/react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const companyNav = [
  {
    name: "Company",
    href: "/settings/company",
    icon: RiBuildingLine,
    activeIcon: RiBuildingFill,
  },
  {
    name: "Team",
    href: "/settings/team",
    icon: RiGroup2Line,
    activeIcon: RiGroup2Fill,
  },
];

const accountNav = [
  {
    name: "Profile",
    href: "/settings/profile",
    icon: RiAccountCircleLine,
    activeIcon: RiAccountCircleFill,
  },
  {
    name: "Security",
    href: "/settings/security",
    icon: RiLock2Line,
    activeIcon: RiLock2Fill,
  },
  {
    name: "Roles",
    href: "/settings/roles",
    icon: RiShieldUserLine,
    activeIcon: RiShieldUserFill,
  },
  {
    name: "API Keys",
    href: "/settings/api",
    icon: RiTerminalBoxLine,
    activeIcon: RiTerminalBoxFill,
  },
  {
    name: "Notifications",
    href: "/settings/notifications",
    icon: RiNotificationLine,
    activeIcon: RiNotificationFill,
  },
];

interface SettingsSidebarProps {
  isBillingEnabled: boolean;
}

export function SettingsSidebar({ isBillingEnabled }: SettingsSidebarProps) {
  const currentPath = usePathname();
  const { data } = useSession();
  const companyPublicId = data?.user.companyPublicId;

  const sideNavData = [
    ...companyNav,
    ...(isBillingEnabled
      ? [
          {
            name: "Billing",
            href: "/settings/billing",
            icon: RiBankCardLine,
            activeIcon: RiBankCardFill,
          },
        ]
      : []),
  ];
  return (
    <ul className="text-sm">
      {sideNavData.map((item) => {
        const href = `/${companyPublicId}${item.href}`;
        const isActive = currentPath === href;

        return (
          <li key={item.name} className="rounded py-1">
            <NavLink
              active={isActive}
              name={item.name}
              href={href}
              icon={isActive ? item.activeIcon : item.icon}
            />
          </li>
        );
      })}

      <div className="mt-3 text-xs font-semibold leading-6 text-gray-400">
        Account
      </div>

      {accountNav.map((item) => {
        const href = `/${companyPublicId}${item.href}`;
        const isActive = currentPath.includes(href) || currentPath === href;

        return (
          <li key={item.name} className="rounded py-1">
            <NavLink
              active={isActive}
              name={item.name}
              href={href}
              icon={isActive ? item.activeIcon : item.icon}
            />
          </li>
        );
      })}
    </ul>
  );
}
