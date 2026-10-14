import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_users");
  if (guard instanceof Response) return guard;

  try {
    const { id } = await params; // ✅ sama di sini

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Gagal menghapus user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_users");
  if (guard instanceof Response) return guard;

  try {
    const { id } = await params; // ✅ WAJIB await di Next 16
    const body = await req.json();

    const { name, email, password, roleId } = body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!name || !email || !roleId) {
      return NextResponse.json(
        { error: "Field wajib tidak lengkap" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah digunakan" },
        { status: 400 }
      );
    }

    let hashedPassword = user.password;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
      },
      include: {
        role: true,
      },
    });

    const { password: _, ...safeUser } = updated;

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { error: "Gagal update user" },
      { status: 500 }
    );
  }
}
