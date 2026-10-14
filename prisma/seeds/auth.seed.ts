import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

export async function seedAuth(prisma: PrismaClient) {
  // ==============================
  // PERMISSIONS
  // ==============================
  const permissions = [
    { name: "view_dashboard" },
    { name: "manage_hero" },
    { name: "manage_service" },
    { name: "manage_blog" },
    { name: "manage_testimoni" },
    { name: "manage_users" },
    { name: "manage_settings" },
    { name: "manage_media" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: {
        id: `perm_${perm.name}`,
        name: perm.name,
      },
    });
  }

  await prisma.rolePermission.deleteMany({
    where: {
      permission: { name: "manage_content" },
    },
  });

  await prisma.permission.deleteMany({
    where: { name: "manage_content" },
  });

  console.log("✅ Auth: Permissions seeded");

  // ==============================
  // ROLES
  // ==============================
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  const operatorRole = await prisma.role.upsert({
    where: { name: "operator" },
    update: {},
    create: { name: "operator" },
  });

  console.log("✅ Auth: Roles seeded");

  // ==============================
  // ROLE PERMISSIONS
  // ==============================
  const allPermissions = await prisma.permission.findMany();

  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  const viewDashboard = await prisma.permission.findUnique({
    where: { name: "view_dashboard" },
  });

  if (viewDashboard) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: operatorRole.id,
          permissionId: viewDashboard.id,
        },
      },
      update: {},
      create: {
        roleId: operatorRole.id,
        permissionId: viewDashboard.id,
      },
    });
  }

  console.log("✅ Auth: RolePermissions seeded");

  // ==============================
  // USERS
  // ==============================
  // ⚠️ Ganti password ini setelah deploy pertama kali!
  const hashedAdmin = await bcrypt.hash("Admin@Secure2000!", 12);
  const hashedOperator = await bcrypt.hash("Operator@Secure2000!", 12);

  await prisma.user.upsert({
    where: { email: "admin@mail.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@mail.com",
      password: hashedAdmin,
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "operator@mail.com" },
    update: {},
    create: {
      name: "Operator",
      email: "operator@mail.com",
      password: hashedOperator,
      roleId: operatorRole.id,
    },
  });

  console.log("✅ Auth: Users seeded");
}
