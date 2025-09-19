import { Check, ChevronRight, Eclipse, Moon, Sun } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../src/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../../../src/components/ui/sidebar";
import { useTheme } from "../../../src/theme-provider";
export function Setting() {
  const { theme, setTheme } = useTheme();

  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupLabel>Setting</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible asChild className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={"Theme"}>
                <Eclipse />
                <span>Theme</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={theme === "light"}
                    onClick={() => setTheme("light")}
                  >
                    <button type="button" className="flex items-center w-full">
                      <Sun className="mr-2" />
                      <span>Light</span>
                      {theme === "light" && (
                        <Check className="ml-auto text-primary" />
                      )}
                    </button>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={theme === "dark"}
                    onClick={() => setTheme("dark")}
                  >
                    <button type="button" className="flex items-center w-full">
                      <Moon className="mr-2" />
                      <span>Dark</span>
                      {theme === "dark" && (
                        <Check className="ml-auto text-primary" />
                      )}
                    </button>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
