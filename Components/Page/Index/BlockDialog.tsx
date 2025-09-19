import { Plus } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { useState } from "react";
import node from "../../../utils/node";
import useBlock from "../../../store/useBlock";

export default function BlockDialog() {
  const data = node;
  const [selected, setSelected] = useState(data.nav[0].name);
  const addBlocks = useBlock((state) => state.setBlocks);
  const addedBlocks = useBlock((state) => state.blocks);
  const handleAddBlock = (alt: string) => {
    addBlocks(alt);
    setTimeout(() => {
      const closeButton = document.querySelector(
        '[data-slot="dialog-close"]'
      ) as HTMLButtonElement;
      closeButton?.click();
    }, 200);
  };

  return (
    <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
      <DialogTitle className="sr-only">Settings</DialogTitle>
      <DialogDescription className="sr-only">
        Customize your settings here.
      </DialogDescription>
      <SidebarProvider className="items-start">
        <Sidebar collapsible="none" className="hidden md:flex">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {data.nav.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.name === selected}
                      >
                        <button onClick={() => setSelected(item.name)}>
                          <item.icon />
                          <span>{item.name}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Add Block</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{selected}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.nav
                .find((item) => item.name === selected)
                ?.node.map((block) => (
                  <div
                    key={block.name}
                    className={`group cursor-pointer relative flex flex-col p-6 bg-card border rounded-lg transition-all duration-200 min-h-[140px] border-border hover:border-primary/50 hover:bg-accent/50`}
                    onClick={() => handleAddBlock(block.alt)}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`p-3 rounded-lg transition-colors shrink-0 bg-primary/10 group-hover:bg-primary/20 text-primary`}
                      >
                        <block.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-sm font-semibold transition-colors mb-2 text-foreground group-hover:text-primary`}
                        >
                          {block.name}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {block.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50">
                      <Button
                        size="sm"
                        className={`w-full transition-all duration-200 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground`}
                      >
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add {block.name}
                        </>
                      </Button>
                    </div>

                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-primary/3`}
                    />

                    {/* Added count badge */}
                    {(() => {
                      const count = addedBlocks.filter(
                        (b) => b.alt === block.alt
                      ).length;
                      return count > 0 ? (
                        <div className="absolute top-2 right-2 min-w-5 h-5 px-2 flex items-center justify-center rounded-full bg-green-500 text-xs text-white font-bold shadow">
                          {count}
                        </div>
                      ) : null;
                    })()}
                  </div>
                ))}
            </div>
          </div>
        </main>
      </SidebarProvider>
    </DialogContent>
  );
}
