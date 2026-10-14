import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

/**
 * 🔥 HELPER: ambil user + permission dari DB
 */
async function getUserWithPermissions(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });
}

export async function requirePermissionPage(permission: string) {
  const session = await auth();

  // ✅ validasi session
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const permissions =
    user.role.permissions.map((rp) => rp.permission.name);

  // 🔥 ADMIN BYPASS
  if (user.role.name === "admin") {
    return session;
  }

  if (!permissions.includes(permission)) {
    redirect("/forbidden");
  }

  return session;
}

/**
 * 🔥 API GUARD (REALTIME DB + ANTI CRASH)
 */
export async function requirePermissionApi(permission: string) {
  const session = await auth();

  // ❌ belum login
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = session.user?.id;

  // ❌ session rusak
  if (!userId) {
    console.error("SESSION ID MISSING:", session);

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await getUserWithPermissions(userId);

  // ❌ user tidak ada
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const permissions =
    user.role?.permissions?.map((rp) => rp.permission.name) ?? [];

  // 🔥 ADMIN BYPASS
  if (user.role?.name === "admin") {
    return session;
  }

  // ❌ tidak punya akses
  if (!permissions.includes(permission)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  return session;
}
