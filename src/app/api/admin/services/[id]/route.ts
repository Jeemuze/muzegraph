import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";

import {
  deleteService,
  getServiceById,
  updateService,
} from "@/lib/services/service.service";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi(
    "manage_service"
  );
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;

    const service = await getServiceById(id);

    if (!service) {
      return NextResponse.json(
        { error: "Service tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("GET SERVICE DETAIL ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil detail service" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi(
    "manage_service"
  );
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;
    const body = await req.json();

    const updated = await updateService(id, body);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE SERVICE ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal update service",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi(
    "manage_service"
  );
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;

    const existing = await prisma.service.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Service tidak ditemukan" },
        { status: 404 }
      );
    }

    await deleteService(id);

    return NextResponse.json({
      message: "Service berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE SERVICE ERROR:", error);

    return NextResponse.json(
      { error: "Gagal menghapus service" },
      { status: 500 }
    );
  }
}
