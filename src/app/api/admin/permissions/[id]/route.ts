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

    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama permission tidak boleh kosong",
        },
        { status: 400 }
      );
    }

    const cleanName = name.trim().toLowerCase();

    const existing = await prisma.permission.findFirst({
      where: {
        name: cleanName,
        NOT: {
          id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama permission sudah digunakan",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.permission.update({
      where: {
        id,
      },
      data: {
        name: cleanName,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal update permission",
      },
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

    const permission = await prisma.permission.findUnique({
      where: {
        id,
      },
      include: {
        roles: true,
      },
    });

    if (!permission) {
      return NextResponse.json(
        {
          success: false,
          error: "Permission tidak ditemukan",
        },
        { status: 404 }
      );
    }

    if (permission.roles.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Permission masih digunakan oleh role",
        },
        { status: 400 }
      );
    }

    await prisma.permission.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Permission berhasil dihapus",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal hapus permission",
      },
      { status: 500 }
    );
  }
}
