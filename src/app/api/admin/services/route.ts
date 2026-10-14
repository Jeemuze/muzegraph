import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { NextResponse } from "next/server";

/* =========================
   🔥 GET SERVICES
========================= */
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        order: "asc",
      },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
        images: {
          include: {
            media: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("GET SERVICES ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data service" },
      { status: 500 }
    );
  }
}

/* =========================
   🔥 CREATE SERVICE
========================= */
export async function POST(req: Request) {
  const guard = await requirePermissionApi("manage_service");
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json();

    const { icon, isActive, order, imageIds, translations } = body;

    if (!translations || !Array.isArray(translations) || translations.length === 0) {
      return NextResponse.json(
        { error: "Translations wajib diisi" },
        { status: 400 }
      );
    }

    /* =========================
       GET ACTIVE LANGUAGES
    ========================= */
    const languages = await prisma.language.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    if (languages.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada bahasa aktif" },
        { status: 400 }
      );
    }

    const defaultLanguage =
      languages.find((lang) => lang.isDefault) || languages[0];

    if (!defaultLanguage) {
      return NextResponse.json(
        { error: "Bahasa default tidak ditemukan" },
        { status: 400 }
      );
    }

    /* =========================
       VALIDATE DEFAULT LANGUAGE ONLY
    ========================= */
    const defaultTranslation = translations.find(
      (item: any) => item.languageId === defaultLanguage.id
    );

    if (
      !defaultTranslation ||
      !defaultTranslation.title?.trim() ||
      !defaultTranslation.slug?.trim()
    ) {
      return NextResponse.json(
        { error: "Translation default wajib diisi" },
        { status: 400 }
      );
    }


    /* =========================
       FILTER EMPTY TRANSLATIONS
    ========================= */
    const validTranslations = translations
      .filter((item: any) => {
        const hasTitle = item.title?.trim();
        const hasSlug = item.slug?.trim();
        const hasDescription =
          item.description &&
          item.description !== "[]" &&
          item.description !== "";

        return hasTitle || hasSlug || hasDescription;
      })

      .map((item: any) => ({
        languageId: item.languageId,
        title: item.title || "",
        slug: item.slug || "",
        description: item.description || "[]",
      }))
      .filter((item: any) => item.languageId);

    if (validTranslations.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada translation valid" },
        { status: 400 }
      );
    }

    /* =========================
       CREATE SERVICE
    ========================= */
    const service = await prisma.service.create({
      data: {
        icon: icon || null,
        isActive: isActive ?? true,
        order: order ?? 0,

        translations: {
          create: validTranslations,
        },

        images:
          imageIds && Array.isArray(imageIds) && imageIds.length > 0
            ? {
                create: imageIds.map(
                  (mediaId: string, index: number) => ({
                    mediaId,
                    order: index,
                  })
                ),
              }
            : undefined,
      },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
        images: {
          include: {
            media: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("CREATE SERVICE ERROR:", error);

    return NextResponse.json(
      { error: "Gagal membuat service" },
      { status: 500 }
    );
  }
}
