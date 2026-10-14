import { requirePermissionPage } from "@/lib/guards/auth";
import { prisma } from "@/lib/prisma";
import { PermissionTable } from "@/components/admin/permissions/permission-table";

export default async function PermissionPage() {
  await requirePermissionPage("manage_users");

  const permissions = await prisma.permission.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  return <PermissionTable permissions={permissions} />;
}
