import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const guard = await requirePermissionApi("manage_users");
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json();
    const { name, email, password, roleId } = body;

    // 🔒 VALIDASI LEBIH KETAT
    if (!name || !email || !password || !roleId) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // 🔎 CEK EMAIL
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah digunakan" },
        { status: 400 }
      );
    }

    // 🔎 VALIDASI ROLE
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role tidak valid" },
        { status: 400 }
      );
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 CREATE USER
    const user = await prisma.user.create({
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

    // ❗ JANGAN RETURN PASSWORD
    const { password: _, ...safeUser } = user;

    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    return NextResponse.json(
      { error: "Gagal membuat user" },
      { status: 500 }
    );
  }
}
