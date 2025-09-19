import * as React from "react";
import {
  Images,
  Calendar,
  Paintbrush,
  LifeBuoy,
  Send,
  CircleStar,
  Eclipse,
  Atom,
} from "lucide-react";

import { Brand } from "../Brand";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "../../../src/components/ui/sidebar";

import { NavUser } from "./nav-user";

import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { Setting } from "./Setting";
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Block",
      url: "/",
      icon: Atom,
      isActive: true,
    },
    {
      title: "Design",
      url: "/design",
      icon: Paintbrush,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: Calendar,
    },
    {
      title: "Gallery",
      url: "/gallery",
      icon: Images,
    },
    {
      title: "Token",
      url: "/token",
      icon: CircleStar,
    },
  ],
  navSecondary: [
    {
      title: "Help",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  navSetting: [
    {
      title: "Theme",
      url: "#",
      icon: Eclipse,
      isActive: true,
      items: [
        {
          title: "Light",
          url: "#",
        },
        {
          title: "Dark",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Brand />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <Setting />
        <NavSecondary items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
