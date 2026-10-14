import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";

import {
  deletePostTag,
  getPostTagById,
  updatePostTag,
} from "@/lib/services/post-tag.service";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi(
    "manage_post_tags"
  );
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;

    const tag = await getPostTagById(id);

    if (!tag) {
      return NextResponse.json(
        { error: "Post tag tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error("GET POST TAG DETAIL ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil detail post tag" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi(
    "manage_post_tags"
  );
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;
    const body = await req.json();

    const updated = await updatePostTag(id, body);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE POST TAG ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal update post tag",
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
    "manage_post_tags"
  );
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;

    const existing = await prisma.postTag.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Post tag tidak ditemukan" },
        { status: 404 }
      );
    }

    await deletePostTag(id);

    return NextResponse.json({
      message: "Post tag berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE POST TAG ERROR:", error);

    return NextResponse.json(
      { error: "Gagal menghapus post tag" },
      { status: 500 }
    );
  }
}
