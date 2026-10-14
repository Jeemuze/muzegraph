import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { heroSchema } from "@/lib/validators/hero";
import { createHero, getHeroes } from "@/lib/services/hero.service";

export async function GET() {
  const guard = await requirePermissionApi("manage_hero");
  if (guard instanceof Response) return guard;

  try {
    const heroes = await getHeroes();
    return NextResponse.json({ success: true, data: heroes });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data hero" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const guard = await requirePermissionApi("manage_hero");
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json();

    // Resolve languageId
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      select: { id: true, code: true, isDefault: true },
    });
    const defaultLang = languages.find((l) => l.isDefault) || languages[0];
    const codeToId = new Map(languages.map((l) => [l.code, l.id]));

    if (Array.isArray(body.translations)) {
      body.translations = body.translations
        .map((t: any) => {
          if (!t) return null;
          const resolvedId = languages.find((l) => l.id === t.languageId)
            ? t.languageId
            : codeToId.get(t.languageId) || defaultLang?.id;
          if (!resolvedId || !t.title?.trim()) return null;
          return { ...t, languageId: resolvedId, title: t.title.trim() };
        })
        .filter(Boolean);
    }

    const parsed = heroSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const hero = await createHero(parsed.data as any);
    return NextResponse.json({ success: true, data: hero }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Gagal membuat hero" }, { status: 500 });
  }
}
