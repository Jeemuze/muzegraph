import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const guard = await requirePermissionApi("manage_users");
  if (guard instanceof Response) return guard;

  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const allPermissions = await prisma.permission.findMany();

    return NextResponse.json({
      roles,
      permissions: allPermissions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal ambil data role" },
      { status: 500 }
    );
  }
}


// ✅ TAMBAH INI
export async function POST(req: Request) {
  const guard = await requirePermissionApi("manage_users");
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama role tidak boleh kosong" },
        { status: 400 }
      );
    }

    // cek duplikat
    const existing = await prisma.role.findUnique({
      where: { name: name.trim().toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Role dengan nama ini sudah ada" },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: { name: name.trim().toLowerCase() },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat role" },
      { status: 500 }
    );
  }
}
