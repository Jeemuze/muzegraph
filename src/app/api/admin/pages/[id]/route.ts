import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requirePermissionApi("manage_pages");
  if (guard instanceof Response) return guard;

  const { id } = await params;
  const page = await prisma.page.findUnique({
    where: { id },
    include: { translations: { include: { language: { select: { id: true, code: true, name: true } } } } },
  });

  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: page });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requirePermissionApi("manage_pages");
  if (guard instanceof Response) return guard;

  const { id } = await params;
  const body = await req.json();
  const { slug, status, translations } = body;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.page.update({ where: { id }, data: { slug, status } });
      await tx.pageTranslation.deleteMany({ where: { pageId: id } });
      if (translations?.length) {
        await tx.pageTranslation.createMany({
          data: translations.filter((t: any) => t.title?.trim()).map((t: any) => ({
            pageId: id,
            languageId: t.languageId,
            title: t.title.trim(),
            content: t.content || null,
            metaTitle: t.metaTitle || null,
            metaDescription: t.metaDescription || null,
          })),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/admin/pages/[id] error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requirePermissionApi("manage_pages");
  if (guard instanceof Response) return guard;

  const { id } = await params;
  await prisma.page.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
