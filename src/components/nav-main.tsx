"use client";

import { usePathname } from "next/navigation";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import { adminMenu } from "@/config/admin-menu";

type BadgeCounts = {
  pendingComments?: number;
  unreadContacts?: number;
};

export function NavMain({
  role,
  permissions,
  badges = {},
}: {
  role: string;
  permissions: string[];
  badges?: BadgeCounts;
}) {
  const pathname = usePathname();
  const isAdmin = role === "admin";

  const filteredNav = adminMenu
    .map((item) => {
      if (!item.items) return item;

      const filteredItems = item.items.filter((sub) => {
        if (isAdmin) return true;
        if (!sub.permission) return true;
        return permissions.includes(sub.permission);
      });

      if (filteredItems.length === 0) return null;

      return { ...item, items: filteredItems };
    })
    .filter(Boolean) as typeof adminMenu;

  const getBadge = (segment: string) => {
    if (segment === "comments" && badges.pendingComments) return badges.pendingComments;
    if (segment === "contacts" && badges.unreadContacts) return badges.unreadContacts;
    return 0;
  };

  const getParentBadge = (item: (typeof adminMenu)[0]) => {
    if (!item.items) return getBadge(item.segment);
    return item.items.reduce((sum, sub) => sum + getBadge(sub.segment), 0);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.url ||
            item.items?.some((sub) => pathname.startsWith(sub.url));
          const parentBadge = getParentBadge(item);

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {item.items ? (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                      <Icon />
                      <span>{item.title}</span>
                      {parentBadge > 0 && (
                        <SidebarMenuBadge>{parentBadge}</SidebarMenuBadge>
                      )}
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                ) : (
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url!}>
                      <Icon />
                      <span>{item.title}</span>
                      {parentBadge > 0 && (
                        <SidebarMenuBadge>{parentBadge}</SidebarMenuBadge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                )}

                {item.items && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const subBadge = getBadge(subItem.segment);
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                                {subBadge > 0 && (
                                  <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                                    {subBadge}
                                  </span>
                                )}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
