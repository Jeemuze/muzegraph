import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { NextResponse } from "next/server";

/* =========================
   🔥 GET DETAIL BLOG POST
========================= */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_blog");
  if (guard instanceof Response) return guard;

  const { id } = await context.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        thumbnail: true,

        featuredMedia: {
          orderBy: {
            order: "asc",
          },
          include: {
            media: true,
          },
        },

        translations: {
          include: {
            language: true,
          },
        },

        categories: {
          include: {
            category: {
              include: {
                translations: true,
              },
            },
          },
        },

        tags: {
          include: {
            tag: {
              include: {
                translations: true,
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

    if (!post) {
      return NextResponse.json(
        { error: "Blog post tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("GET BLOG POST ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil blog post" },
      { status: 500 }
    );
  }
}

/* =========================
   🔥 DELETE BLOG POST
========================= */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_blog");
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Blog post tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Blog post berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE BLOG POST ERROR:", error);

    return NextResponse.json(
      { error: "Gagal menghapus blog post" },
      { status: 500 }
    );
  }
}

/* =========================
   🔥 UPDATE BLOG POST
========================= */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_blog");
  if (guard instanceof Response) return guard;

  try {
    const { id } = await context.params;
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

    if (!translations?.length) {
      return NextResponse.json(
        { error: "Translations wajib diisi" },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existingPost = await tx.post.findUnique({
  where: { id },
  select: {
    status: true,
    publishedAt: true,
  },
});

await tx.post.update({
  where: { id },
  data: {
    status,
    isFeatured,
    allowComments,
    readingTime,
    thumbnailId: thumbnailId || null,
    publishedAt:
      status === "DRAFT"
        ? null
        : publishedAt
        ? new Date(publishedAt)
        : existingPost?.publishedAt || new Date(),
  },
});

      await tx.blogPostMedia.deleteMany({
        where: { postId: id },
      });

      if (featuredMediaIds?.length) {
        await tx.blogPostMedia.createMany({
          data: featuredMediaIds.map(
            (mediaId: string, index: number) => ({
              postId: id,
              mediaId,
              order: index,
            })
          ),
        });
      }

for (const item of translations) {
  const existingSlug = await tx.postTranslation.findFirst({
    where: {
      slug: item.slug,
      languageId: item.languageId,
      postId: {
        not: id,
      },
    },
  });

  if (existingSlug) {
    throw new Error(
      `Slug "${item.slug}" sudah digunakan pada bahasa tersebut`
    );
  }
}

await tx.postTranslation.deleteMany({
  where: { postId: id },
});

await tx.postTranslation.createMany({
  data: translations.map((item: any) => ({
          postId: id,
          languageId: item.languageId,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt || null,
          content: item.content,
          metaTitle: item.metaTitle || null,
          metaDescription: item.metaDescription || null,
          keywords: item.keywords || null,
        })),
      });

      await tx.postToCategory.deleteMany({
        where: { postId: id },
      });

      if (categoryIds?.length) {
        await tx.postToCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({
            postId: id,
            categoryId,
          })),
        });
      }

      await tx.postToTag.deleteMany({
        where: { postId: id },
      });

      if (tagIds?.length) {
        await tx.postToTag.createMany({
          data: tagIds.map((tagId: string) => ({
            postId: id,
            tagId,
          })),
        });
      }

      return tx.post.findUnique({
        where: { id },
        include: {
          translations: {
            include: {
              language: true,
            },
          },
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE BLOG POST ERROR:", error);

return NextResponse.json(
  {
    error:
      error instanceof Error
        ? error.message
        : "Gagal update blog post",
  },
  { status: 500 }
);
  }
}
