import * as React from "react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CommandSearchButton } from "./command-search-button";
import { SETTINGS_NAV_ITEMS } from "../lib/settings-navigation";

const data = {
  navMain: SETTINGS_NAV_ITEMS.map(({ title, url, icon }) => ({
    title,
    url,
    icon: typeof icon === "string" ? undefined : icon,
  })),
};

export function SettingsSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <div className="h-[var(--header-height)]"></div>
      <SidebarHeader className="py-0 -mb-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <div className="inline-flex items-center gap-2.5 font-semibold w-full">
                <img
                  src="assets/logo.svg"
                  alt="Amical Logo"
                  className="!size-7"
                />
                <span className="font-semibold">Amical</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <CommandSearchButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
