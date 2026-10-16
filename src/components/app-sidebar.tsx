"use client";

import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { GalleryVerticalEndIcon } from "lucide-react";

import content from "@/content/content.json";
import Image from "next/image";
import { useTheme } from "next-themes";

type Props = React.ComponentProps<typeof Sidebar> & {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
    permissions?: string[];
  };
  badges?: {
    pendingComments?: number;
    unreadContacts?: number;
  };
  siteName?: string;
  siteLogoDark?: string | null;
  siteLogoLight?: string | null;
};

export function AppSidebar({ user, badges, siteName, siteLogoDark, siteLogoLight, ...props }: Props) {
  const name = siteName || content.site.name;
  const { resolvedTheme } = useTheme();
  
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const logo = resolvedTheme === "dark" 
    ? (siteLogoDark || "/assets/logo-dark.png") 
    : (siteLogoLight || "/assets/logo-light.png");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              {}
              {mounted && logo ? (
                <div className="flex size-8 items-center justify-center rounded-lg bg-white/80 dark:bg-zinc-900/80">
                  <Image src={logo} alt={name} width={24} height={24} className="object-contain" />
                </div>
              ) : (
                <div className="flex size-8 items-center justify-center rounded-lg border bg-background shadow-sm">
                  <GalleryVerticalEndIcon className="size-4 text-muted-foreground animate-pulse" />
                </div>
              )}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs text-muted-foreground">Admin Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain
          role={user?.role ?? ""}
          permissions={user?.permissions ?? []}
          badges={badges}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}