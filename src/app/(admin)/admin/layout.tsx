import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppSidebar } from "@/components/app-sidebar";
import { AdminBreadcrumb } from "@/components/admin-breadcrumb";

import content from "@/content/content.json";
import { Metadata } from "next";
import { getAdminTitle } from "@/lib/admin-title";

import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";

import SessionProviderWrapper from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/admin/providers/theme-provider"
import { ThemeToggle } from "@/components/admin/shared/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

/* =========================
   🔥 CACHE USER QUERY
========================= */

const getUserWithPermissions = cache(async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: {
        select: {
          name: true,
          permissions: {
            select: {
              permission: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });
});

/* =========================
   🔥 AUTO TITLE (ADMIN ONLY)
========================= */

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[] };
}): Promise<Metadata> {
  const lastSegment = params?.slug?.[params.slug.length - 1];
  const title = getAdminTitle(lastSegment);
  const seo = await prisma.seo.findFirst();

  return {
    title: `${title} | ${content.site.name}`,
    icons: {
      icon: seo?.favicon || "/assets/favicon.png",
    },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}

/* =========================
   🔥 ADMIN LAYOUT
========================= */

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔥 WAJIB: disable cache untuk data user
  noStore();

  const session = await auth();

  // 🔥 redirect kalau belum login
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 🔥 ambil user + permissions
  const user = await getUserWithPermissions(session.user.id);

  // 🔥 safety kalau user tidak ditemukan di DB
  if (!user) {
    redirect("/login");
  }

  const role = user.role?.name ?? "";
  const permissions =
    user.role?.permissions?.map((p) => p.permission.name) ?? [];

  const sidebarUser = {
    ...session.user,
    role,
    permissions,
  };

  const [pendingComments, unreadContacts, seo] = await Promise.all([
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { status: "UNREAD" } }),
    prisma.seo.findFirst(),
  ]);

  const siteName = seo?.siteName || content.site.name;
  const siteLogoDark = seo?.siteLogoDark || seo?.siteLogo || null;
  const siteLogoLight = seo?.siteLogoLight || seo?.siteLogo || null;

  return (
<SessionProviderWrapper session={session}>
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar user={sidebarUser} badges={{ pendingComments, unreadContacts }} siteName={siteName} siteLogoDark={siteLogoDark} siteLogoLight={siteLogoLight} />

        <SidebarInset className="overflow-hidden">
          <div className="p-6 space-y-6 min-w-0 overflow-x-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <AdminBreadcrumb />
              </div>

              <ThemeToggle />
            </div>

            <main>{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  </ThemeProvider>
</SessionProviderWrapper>
  );
}
