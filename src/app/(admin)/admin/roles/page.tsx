import { requirePermissionPage } from "@/lib/guards/auth";
import { prisma } from "@/lib/prisma";
import { RoleTable } from "@/components/admin/roles/role-table";

export default async function RolePage() {
  await requirePermissionPage("manage_users");

  const roles = await prisma.role.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  });

  return <RoleTable roles={roles} />;
}
