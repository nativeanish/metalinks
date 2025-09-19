import type { LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../../src/components/ui/sidebar";
import { useNavigate, useLocation } from "@tanstack/react-router";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Addon</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                className={`
                  flex items-center gap-2 px-2 py-1 rounded-md transition-colors
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground"
                      : "hover:bg-muted hover:text-foreground dark:hover:bg-muted/70 dark:hover:text-white"
                  }
                  ${
                    isActive
                      ? "!bg-primary !text-primary-foreground !dark:bg-primary !dark:text-primary-foreground"
                      : ""
                  }
                `}
              >
                <div onClick={() => navigate({ to: item.url })}>
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.title}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
