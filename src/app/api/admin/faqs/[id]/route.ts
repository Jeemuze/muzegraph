import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";

import {
  deleteFaq,
  getFaqById,
  updateFaq,
} from "@/lib/services/faq.service";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_faq");
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;

    const faq = await getFaqById(id);

    if (!faq) {
      return NextResponse.json(
        { error: "FAQ tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(faq);
  } catch (error) {
    console.error("GET FAQ DETAIL ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil detail FAQ" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_faq");
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;
    const body = await req.json();

    const updated = await updateFaq(id, body);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE FAQ ERROR:", error);

    return NextResponse.json(
      { error: "Gagal update FAQ" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_faq");
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;

    const existing = await prisma.faq.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "FAQ tidak ditemukan" },
        { status: 404 }
      );
    }

    await deleteFaq(id);

    return NextResponse.json({
      message: "FAQ berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE FAQ ERROR:", error);

    return NextResponse.json(
      { error: "Gagal menghapus FAQ" },
      { status: 500 }
    );
  }
}
