import { requirePermissionPage } from "@/lib/guards/auth";
import { prisma } from "@/lib/prisma";
import { UserTable } from "@/components/admin/users/user-table";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
  description: "Kelola data pengguna, role, dan akses sistem.",
};

export default async function UsersPage() {
  await requirePermissionPage("manage_users");

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.role.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return <UserTable users={users} roles={roles} />;
}
