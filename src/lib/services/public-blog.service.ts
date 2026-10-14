import { prisma } from "@/lib/prisma";

export async function getPublishedPosts(locale: string) {
  return prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: {
        lte: new Date(),
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    select: {
      id: true,
      publishedAt: true,
      viewCount: true,
      readingTime: true,
      isFeatured: true,

      thumbnail: {
        select: {
          url: true,
        },
      },

      author: {
        select: {
          name: true,
        },
      },

      translations: {
        where: {
          language: {
            code: locale,
          },
        },
        select: {
          title: true,
          slug: true,
          excerpt: true,
        },
        take: 1,
      },
    },
  });
}

export async function getPublishedPostBySlug(
  slug: string,
  locale: string
) {
  return prisma.post.findFirst({
    where: {
      status: "PUBLISHED",
      publishedAt: {
        lte: new Date(),
      },
      translations: {
        some: {
          slug,
          language: {
            code: locale,
          },
        },
      },
    },
    select: {
      id: true,
      publishedAt: true,
      viewCount: true,
      readingTime: true,
      allowComments: true,

      thumbnail: {
        select: {
          url: true,
        },
      },

      author: {
        select: {
          name: true,
        },
      },

      featuredMedia: {
        orderBy: { order: "asc" },
        select: {
          media: {
            select: {
              id: true,
              name: true,
              url: true,
              type: true,
              mimeType: true,
            },
          },
        },
      },

      translations: {
        select: {
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          metaTitle: true,
          metaDescription: true,
          keywords: true,
          language: {
            select: {
              code: true,
            },
          },
        },
      },
    },
  });
}
