import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { seoSchema } from "@/lib/validators/page";

export async function GET() {
  const guard = await requirePermissionApi("manage_settings");
  if (guard instanceof Response) return guard;

  try {
    const seo = await prisma.seo.findFirst();
    return NextResponse.json({ success: true, data: seo });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data SEO" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const guard = await requirePermissionApi("manage_settings");
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json();

    const parsed = seoSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError.message, details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.seo.findFirst();

    const data = existing
      ? await prisma.seo.update({ where: { id: existing.id }, data: parsed.data })
      : await prisma.seo.create({ data: parsed.data });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal update SEO";
    console.error("[SEO API Error]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
