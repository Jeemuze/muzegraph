import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const guard = await requirePermissionApi("manage_users");
  if (guard instanceof Response) return guard;

  try {
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

    return NextResponse.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil data permission",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const guard = await requirePermissionApi("manage_users");
  if (guard instanceof Response) return guard;

  try {
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

    const existing = await prisma.permission.findUnique({
      where: {
        name: cleanName,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Permission sudah ada",
        },
        { status: 400 }
      );
    }

    const permission = await prisma.permission.create({
      data: {
        name: cleanName,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: permission,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal membuat permission",
      },
      { status: 500 }
    );
  }
}
