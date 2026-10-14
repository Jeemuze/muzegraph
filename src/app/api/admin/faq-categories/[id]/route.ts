import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { NextResponse } from "next/server";

/* =========================
   GET DETAIL CATEGORY
========================= */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const category = await prisma.faqCategory.findUnique({
      where: { id },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("GET FAQ CATEGORY DETAIL ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil detail kategori" },
      { status: 500 }
    );
  }
}

/* =========================
   UPDATE CATEGORY
========================= */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_faq");
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;
    const body = await req.json();

    const {
      slug,
      isActive,
      order,
      translations,
    } = body;

    await prisma.faqCategory.update({
      where: { id },
      data: {
        slug,
        isActive: isActive ?? true,
        order: order ?? 0,
      },
    });

    await prisma.faqCategoryTranslation.deleteMany({
      where: {
        categoryId: id,
      },
    });

    await prisma.faqCategoryTranslation.createMany({
      data: translations.map((item: any) => ({
        categoryId: id,
        languageId: item.languageId,
        name: item.name,
        description: item.description || null,
      })),
    });

    const updated = await prisma.faqCategory.findUnique({
      where: { id },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE FAQ CATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Gagal update kategori" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE CATEGORY
========================= */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_faq");
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;

    await prisma.faqCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE FAQ CATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}
