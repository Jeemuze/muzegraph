"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// 🔥 mapping label custom (biar gak aneh dari URL)
const routeNameMap: Record<string, string> = {
  admin: "Dashboard",
  users: "User",
  roles: "Role",
  permissions: "Permission",
  blog: "Blog",
  create: "Create",
  edit: "Edit",
};

function formatLabel(segment: string) {
  // kalau ada di map → pakai itu
  if (routeNameMap[segment]) {
    return routeNameMap[segment];
  }

  // fallback auto format
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AdminBreadcrumb() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* ROOT */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/admin">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.slice(1).map((segment, index) => {
          const href = "/" + segments.slice(0, index + 2).join("/");
          const isLast = index === segments.length - 2;

          // 🔥 skip dynamic id (biar gak tampil UUID)
          const isId = segment.length > 20; // simple heuristic

          if (isId) return null;

          const label = formatLabel(segment);

          return (
            <BreadcrumbItem key={href}>
              <BreadcrumbSeparator />

              {isLast ? (
                <BreadcrumbPage>{label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={href}>{label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
