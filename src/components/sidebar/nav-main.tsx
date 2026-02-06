"use client";

import { IconChevronRight } from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import type { NavGroup, NavItem } from "@/types";

function NavItemRenderer({ item }: { item: NavItem }) {
  // If item has children, render as collapsible
  if (item.items && item.items.length > 0) {
    return (
      <Collapsible
        key={item.title}
        defaultOpen={item.isActive ?? item.expanded}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <div className="flex w-full items-center">
            <SidebarMenuButton tooltip={item.description ?? item.title} asChild className="flex-1">
              <Link href={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
            <CollapsibleTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-sidebar-accent">
                <IconChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items.map((subItem) => {
                // Recursively render each child
                if (subItem.items && subItem.items.length > 0) {
                  return <NavItemRenderer key={subItem.title} item={subItem} />;
                }
                return (
                  <SidebarMenuSubItem key={subItem.title}>
                    {subItem.description ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url}>
                                {subItem.icon && <subItem.icon />}
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </TooltipTrigger>
                          <TooltipContent>
                            {subItem.description}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <SidebarMenuSubButton asChild>
                        <Link href={subItem.url}>
                          {subItem.icon && <subItem.icon />}
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    )}
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  // Otherwise, render as simple link
  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton tooltip={item.description ?? item.title} asChild>
        <Link href={item.url}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavMainGroup({
  items,
}: {
  items: NavGroup[]
}) {
  return (
    <>
      {items.map((group, groupIndex) => (
        <SidebarGroup key={group.title ?? `group-${groupIndex}`}>
          {group.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <NavItemRenderer key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
