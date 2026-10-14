import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_users");
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;
    const body = await req.json();

    const { permissionIds } = body;

    if (!Array.isArray(permissionIds)) {
      return NextResponse.json(
        { error: "permissionIds harus array" },
        { status: 400 }
      );
    }

    await prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((pid: string) => ({
          roleId: id,
          permissionId: pid,
        })),
      });
    }

    return NextResponse.json({
      message: "Permission berhasil diupdate",
    });
  } catch (error) {
    console.error("PUT ERROR:", error);

    return NextResponse.json(
      { error: "Gagal update permission" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_users");
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;

    // 🔎 cek role
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        users: true, // penting kalau ada relasi ke user
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role tidak ditemukan" },
        { status: 404 }
      );
    }

    // 🚫 jangan hapus kalau masih dipakai user
    if (role.users.length > 0) {
      return NextResponse.json(
        { error: "Role masih digunakan oleh user" },
        { status: 400 }
      );
    }

    // 🔥 optional: protect role tertentu
    if (role.name === "admin") {
      return NextResponse.json(
        { error: "Role admin tidak boleh dihapus" },
        { status: 403 }
      );
    }

    // 🔥 hapus relasi permission dulu
    await prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    // 🔥 hapus role
    await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Role berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Gagal menghapus role" },
      { status: 500 }
    );
  }
}
