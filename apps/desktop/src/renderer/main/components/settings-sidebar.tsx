import * as React from "react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
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
      {/* Desktop: header height spacer, Mobile: traffic light spacer (40px) */}
      <div className="h-10 md:h-[var(--header-height)]"></div>
      <SidebarHeader className="py-0 -mb-1">
        <SidebarMenu>
          <SidebarMenuItem>
              <div className="inline-flex items-center gap-2.5 font-semibold w-full p-1.5">
                <img
                  src="assets/logo.svg"
                  alt="surasura Logo"
                  className="!size-7"
                />
                <span className="font-semibold font-brand">surasura</span>
              </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
