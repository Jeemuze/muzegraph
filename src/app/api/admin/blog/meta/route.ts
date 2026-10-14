import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const guard = await requirePermissionApi("manage_blog");
  if (guard instanceof Response) return guard;

  try {
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    const categories = await prisma.postCategory.findMany({
      orderBy: { createdAt: "desc" },
      include: { translations: true },
    });

    const tags = await prisma.postTag.findMany({
      orderBy: { createdAt: "desc" },
      include: { translations: true },
    });

    return NextResponse.json({
      languages,
      categories,
      tags,
    });
  } catch (error) {
    console.error("BLOG META API ERROR:", error);

    return NextResponse.json(
      {
        error: "Gagal mengambil meta data blog",
        detail: String(error),
      },
      { status: 500 }
    );
  }
}
