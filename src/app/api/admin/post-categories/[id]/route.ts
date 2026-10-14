import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";

import {
  deletePostCategory,
  getPostCategoryById,
  updatePostCategory,
} from "@/lib/services/post-category.service";

/* =========================
   🔥 GET DETAIL POST CATEGORY
========================= */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi(
    "manage_post_categories"
  );
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;

    const category = await getPostCategoryById(id);

    if (!category) {
      return NextResponse.json(
        { error: "Post category tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error(
      "GET POST CATEGORY DETAIL ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Gagal mengambil detail post category" },
      { status: 500 }
    );
  }
}

/* =========================
   🔥 UPDATE POST CATEGORY
========================= */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi(
    "manage_post_categories"
  );
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;
    const body = await req.json();

    const {
      icon,
      isActive,
      order,
      translations,
    } = body;

    if (!translations?.length) {
      return NextResponse.json(
        { error: "Translations wajib diisi" },
        { status: 400 }
      );
    }

const updated = await prisma.$transaction(
  async (tx) => {
    const existing = await tx.postCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Post category tidak ditemukan");
    }

    for (const item of translations) {
      const existingSlug =
        await tx.postCategoryTranslation.findFirst({
          where: {
            slug: item.slug,
            languageId: item.languageId,
            categoryId: {
              not: id,
            },
          },
        });

      if (existingSlug) {
        throw new Error(
          `Slug "${item.slug}" sudah digunakan pada bahasa tersebut`
        );
      }
    }

    await tx.postCategory.update({
      where: { id },
      data: {
        icon: icon || null,
        isActive,
        order,
      },
    });

    await tx.postCategoryTranslation.deleteMany({
      where: {
        categoryId: id,
      },
    });

    await tx.postCategoryTranslation.createMany({
      data: translations.map((item: any) => ({
        categoryId: id,
        languageId: item.languageId,
        name: item.name,
        slug: item.slug,
        description: item.description || null,
      })),
    });

    return tx.postCategory.findUnique({
      where: { id },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
      },
    });
  }
);

    return NextResponse.json(updated);
  } catch (error) {
    console.error(
      "UPDATE POST CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal update post category",
      },
      { status: 500 }
    );
  }
}

/* =========================
   🔥 DELETE POST CATEGORY
========================= */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi(
    "manage_post_categories"
  );
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;

    const existing =
      await prisma.postCategory.findUnique({
        where: { id },
      });

    if (!existing) {
      return NextResponse.json(
        { error: "Post category tidak ditemukan" },
        { status: 404 }
      );
    }

    await deletePostCategory(id);

    return NextResponse.json({
      message: "Post category berhasil dihapus",
    });
  } catch (error) {
    console.error(
      "DELETE POST CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Gagal menghapus post category" },
      { status: 500 }
    );
  }
}
