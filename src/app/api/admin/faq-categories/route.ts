import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { NextResponse } from "next/server";

/* =========================
   GET FAQ CATEGORIES
========================= */
export async function GET() {
  try {
    const categories = await prisma.faqCategory.findMany({
      orderBy: {
        order: "asc",
      },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
        _count: {
          select: {
            faqs: true,
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET FAQ CATEGORIES ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data kategori FAQ" },
      { status: 500 }
    );
  }
}

/* =========================
   CREATE FAQ CATEGORY
========================= */
export async function POST(req: Request) {
  const guard = await requirePermissionApi("manage_faq");
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json();

    const {
      slug,
      isActive,
      order,
      translations,
    } = body;

    if (!slug?.trim()) {
      return NextResponse.json(
        { error: "Slug wajib diisi" },
        { status: 400 }
      );
    }

    if (!translations?.length) {
      return NextResponse.json(
        { error: "Translations wajib diisi" },
        { status: 400 }
      );
    }

    const existing = await prisma.faqCategory.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Slug sudah digunakan" },
        { status: 400 }
      );
    }

    const category = await prisma.faqCategory.create({
      data: {
        slug,
        isActive: isActive ?? true,
        order: order ?? 0,

        translations: {
          create: translations.map((item: any) => ({
            languageId: item.languageId,
            name: item.name,
            description: item.description || null,
          })),
        },
      },

      include: {
        translations: {
          include: {
            language: true,
          },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("CREATE FAQ CATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Gagal membuat kategori FAQ" },
      { status: 500 }
    );
  }
}
