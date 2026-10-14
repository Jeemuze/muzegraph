import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { NextResponse } from "next/server";

/* =========================
   🔥 GET TESTIMONIALS
========================= */
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: {
        order: "asc",
      },
      include: {
        avatar: true,
        translations: {
          include: {
            language: true,
          },
        },
      },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("GET TESTIMONIALS ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data testimonial" },
      { status: 500 }
    );
  }
}

/* =========================
   🔥 CREATE TESTIMONIAL
========================= */
export async function POST(req: Request) {
  const guard = await requirePermissionApi("manage_testimonial");
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json();

    const {
      clientName,
      clientRole,
      companyName,
      companyUrl,
      projectName,
      rating,
      avatarId,
      isFeatured,
      isActive,
      order,
      translations,
    } = body;

    /* =========================
       BASIC VALIDATION
    ========================= */
    if (!clientName?.trim()) {
      return NextResponse.json(
        { error: "Nama client wajib diisi" },
        { status: 400 }
      );
    }

    if (
      !translations ||
      !Array.isArray(translations) ||
      translations.length === 0
    ) {
      return NextResponse.json(
        { error: "Translations wajib diisi" },
        { status: 400 }
      );
    }

    /* =========================
       NORMALIZE DATA
    ========================= */
    const normalizedAvatarId =
      typeof avatarId === "string" && avatarId.trim()
        ? avatarId.trim()
        : null;

    const normalizedRating =
      typeof rating === "number" && rating >= 1 && rating <= 5
        ? rating
        : 5;

    const normalizedOrder =
      typeof order === "number" && order >= 0 ? order : 0;

    /* =========================
       VALIDATE AVATAR EXISTS
    ========================= */
    if (normalizedAvatarId) {
      const media = await prisma.media.findUnique({
        where: {
          id: normalizedAvatarId,
        },
        select: {
          id: true,
        },
      });

      if (!media) {
        return NextResponse.json(
          { error: "Avatar tidak ditemukan" },
          { status: 400 }
        );
      }
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

    const defaultTranslation = translations.find(
      (item: any) => item.languageId === defaultLanguage.id
    );

    if (!defaultTranslation || !defaultTranslation.content?.trim()) {
      return NextResponse.json(
        { error: "Translation default wajib diisi" },
        { status: 400 }
      );
    }

    /* =========================
       FILTER VALID TRANSLATIONS
    ========================= */
    const validTranslations = translations
      .filter(
        (item: any) =>
          item.languageId &&
          typeof item.content === "string" &&
          item.content.trim()
      )
      .map((item: any) => ({
        languageId: item.languageId,
        content: item.content.trim(),
      }));

    if (validTranslations.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada translation valid" },
        { status: 400 }
      );
    }

    /* =========================
       CREATE TESTIMONIAL
    ========================= */
    const testimonial = await prisma.testimonial.create({
      data: {
        clientName: clientName.trim(),
        clientRole: clientRole?.trim() || null,
        companyName: companyName?.trim() || null,
        companyUrl: companyUrl?.trim() || null,
        projectName: projectName?.trim() || null,
        rating: normalizedRating,
        avatarId: normalizedAvatarId,
        isFeatured: Boolean(isFeatured),
        isActive: isActive ?? true,
        order: normalizedOrder,

        translations: {
          create: validTranslations,
        },
      },
      include: {
        avatar: true,
        translations: {
          include: {
            language: true,
          },
        },
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("CREATE TESTIMONIAL ERROR:", error);

    return NextResponse.json(
      {
        error: "Gagal membuat testimonial",
      },
      { status: 500 }
    );
  }
}
