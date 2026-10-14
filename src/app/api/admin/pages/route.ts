import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";

export async function GET() {
  const guard = await requirePermissionApi("manage_pages");
  if (guard instanceof Response) return guard;

  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, slug: true, status: true, isHomePage: true, template: true, updatedAt: true,
      translations: { select: { title: true, language: { select: { id: true, code: true } } } },
    },
  });

  return NextResponse.json({ success: true, data: pages });
}

export async function POST(req: Request) {
  const guard = await requirePermissionApi("manage_pages");
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json();
    const { slug, status, translations } = body;

    if (!slug?.trim()) return NextResponse.json({ error: "Slug is required" }, { status: 400 });

    const validTranslations = (translations || []).filter((t: any) => t.title?.trim());
    if (!validTranslations.length) return NextResponse.json({ error: "At least one title is required" }, { status: 400 });

    const page = await prisma.page.create({
      data: {
        slug: slug.trim(),
        status: status || "PUBLISHED",
        publishedAt: new Date(),
        translations: {
          create: validTranslations.map((t: any) => ({
            languageId: t.languageId,
            title: t.title.trim(),
            content: t.content || null,
            metaTitle: t.metaTitle || null,
            metaDescription: t.metaDescription || null,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, data: page }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/pages error:", error);
    if (error?.code === "P2002") return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    return NextResponse.json({ error: error?.message || "Failed to create page" }, { status: 500 });
  }
}
