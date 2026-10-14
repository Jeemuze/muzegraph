import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { NextResponse } from "next/server";

/* =========================
   GET FAQS
========================= */
export async function GET() {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: {
        order: "asc",
      },
      include: {
        category: {
          include: {
            translations: {
              include: {
                language: true,
              },
            },
          },
        },
        translations: {
          include: {
            language: true,
          },
        },
      },
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error("GET FAQS ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data FAQ" },
      { status: 500 }
    );
  }
}

/* =========================
   CREATE FAQ
========================= */
export async function POST(req: Request) {
  const guard = await requirePermissionApi("manage_faq");
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json();

    const {
      categoryId,
      isFeatured,
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

    const faq = await prisma.faq.create({
      data: {
        categoryId: categoryId || null,
        isFeatured: isFeatured ?? false,
        isActive: isActive ?? true,
        order: order ?? 0,

        translations: {
          create: translations.map((item: any) => ({
            languageId: item.languageId,
            question: item.question,
            answer: item.answer,
          })),
        },
      },

      include: {
        category: true,
        translations: {
          include: {
            language: true,
          },
        },
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error("CREATE FAQ ERROR:", error);

    return NextResponse.json(
      { error: "Gagal membuat FAQ" },
      { status: 500 }
    );
  }
}
