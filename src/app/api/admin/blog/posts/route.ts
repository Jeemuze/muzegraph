import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { NextResponse } from "next/server";

/* =========================
   🔥 GET BLOG POSTS
========================= */
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        viewCount: true,
        readingTime: true,
        allowComments: true,

        thumbnail: {
          select: {
            id: true,
            url: true,
            name: true,
            type: true,
          },
        },

        featuredMedia: {
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            order: true,
            media: {
              select: {
                id: true,
                url: true,
                name: true,
                type: true,
              },
            },
          },
        },

        translations: {
          select: {
            id: true,
            title: true,
            slug: true,
            language: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },

        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET BLOG POSTS ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data blog posts" },
      { status: 500 }
    );
  }
}

/* =========================
   🔥 CREATE BLOG POST
========================= */
export async function POST(req: Request) {
  const guard = await requirePermissionApi("manage_blog");
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json();

    const {
      status,
      publishedAt,
      isFeatured,
      allowComments,
      readingTime,
      thumbnailId,
      featuredMediaIds,
      categoryIds,
      tagIds,
      translations,
    } = body;

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

    /* =========================
       VALIDATE DEFAULT LANGUAGE
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
       FILTER VALID TRANSLATIONS
    ========================= */
    const validTranslations = translations
      .filter((item: any) => {
        const hasTitle = item.title?.trim();
        const hasSlug = item.slug?.trim();
        const hasContent =
          item.content &&
          item.content !== "[]" &&
          item.content !== "";

        return hasTitle || hasSlug || hasContent;
      })
.map((item: any) => ({
  languageId: item.languageId,
  title: item.title || "",
  slug: item.slug || "",
  excerpt: item.excerpt || null,
  content: item.content || "[]",
  metaTitle: item.metaTitle || null,
  metaDescription: item.metaDescription || null,
  keywords: item.keywords || null,
}))
.filter((item: any) => item.languageId);

    if (validTranslations.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada translation valid" },
        { status: 400 }
      );
    }

    /* =========================
       CHECK DUPLICATE SLUG
    ========================= */
    for (const item of validTranslations) {
      const existing = await prisma.postTranslation.findFirst({
        where: {
          slug: item.slug,
          languageId: item.languageId,
        },
        select: { id: true },
      });

      if (existing) {
        return NextResponse.json(
          {
            error: `Slug '${item.slug}' sudah digunakan`,
          },
          { status: 400 }
        );
      }
    }

    /* =========================
       GET ADMIN
    ========================= */
    const admin = await prisma.user.findFirst({
      where: {
        role: {
          name: "admin",
        },
      },
      select: {
        id: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin user tidak ditemukan" },
        { status: 404 }
      );
    }

    /* =========================
       CREATE POST
    ========================= */
const post = await prisma.post.create({
  data: {
    authorId: admin.id,
    status: status || "DRAFT",
    publishedAt:
      (status || "DRAFT") === "PUBLISHED"
        ? publishedAt
          ? new Date(publishedAt)
          : new Date()
        : null,
    isFeatured: isFeatured ?? false,
    allowComments: allowComments ?? true,
    readingTime: readingTime ?? 1,
    thumbnailId: thumbnailId || null,

    translations: {
      create: validTranslations,
    },

    categories:
      categoryIds?.length > 0
        ? {
            create: categoryIds.map((categoryId: string) => ({
              categoryId,
            })),
          }
        : undefined,

    tags:
      tagIds?.length > 0
        ? {
            create: tagIds.map((tagId: string) => ({
              tagId,
            })),
          }
        : undefined,

    featuredMedia:
      featuredMediaIds?.length > 0
        ? {
            create: featuredMediaIds.map(
              (mediaId: string, index: number) => ({
                mediaId,
                order: index,
              })
            ),
          }
        : undefined,
  },

  include: {
    thumbnail: true,
    featuredMedia: {
      include: {
        media: true,
      },
    },
    translations: {
      include: {
        language: true,
      },
    },
  },
});

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("CREATE BLOG POST ERROR:", error);

return NextResponse.json(
  {
    error:
      error instanceof Error
        ? error.message
        : "Gagal membuat blog post",
  },
  { status: 500 }
);
  }
}
