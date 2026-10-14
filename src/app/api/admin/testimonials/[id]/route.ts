import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";

import {
  deleteTestimonial,
  getTestimonialById,
  updateTestimonial,
} from "@/lib/services/testimonial.service";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_testimonial");
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;

    const testimonial = await getTestimonialById(id);

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("GET TESTIMONIAL DETAIL ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil detail testimonial" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_testimonial");
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;
    const body = await req.json();

    const updated = await updateTestimonial(id, body);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE TESTIMONIAL ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal update testimonial",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_testimonial");
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;

    const existing = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Testimonial tidak ditemukan" },
        { status: 404 }
      );
    }

    await deleteTestimonial(id);

    return NextResponse.json({
      message: "Testimonial berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE TESTIMONIAL ERROR:", error);

    return NextResponse.json(
      { error: "Gagal menghapus testimonial" },
      { status: 500 }
    );
  }
}
