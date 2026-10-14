import { prisma } from "@/lib/prisma";

type PortfolioTranslationInput = {
  languageId: string;
  title: string;
  excerpt?: string | null;
  description: string;
  result?: string | null;
};

type PortfolioPayload = {
  slug: string;
  clientName?: string | null;
  industry?: string | null;
  location?: string | null;
  completedAt?: string | Date | null;
  coverImageId?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  order?: number;
  translations: PortfolioTranslationInput[];
  galleryIds?: string[];
  tagIds?: string[];
};

export async function getPortfolios() {
  const portfolios = await prisma.portfolio.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: {
      coverImage: true,
      translations: {
        include: {
          language: true,
        },
      },
      galleries: {
        include: {
          media: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      tags: {
        include: {
          tag: {
            include: {
              translations: {
                include: {
                  language: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return portfolios;
}

export async function getPortfolioById(id: string) {
  return prisma.portfolio.findUnique({
    where: { id },
    include: {
      coverImage: true,
      translations: {
        include: {
          language: true,
        },
      },
      galleries: {
        include: {
          media: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      tags: {
        include: {
          tag: {
            include: {
              translations: {
                include: {
                  language: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function createPortfolio(payload: PortfolioPayload) {
  const {
    slug,
    clientName,
    industry,
    location,
    completedAt,
    coverImageId,
    isFeatured,
    isActive,
    order,
    translations,
    galleryIds,
    tagIds,
  } = payload;

  if (!slug?.trim()) {
    throw new Error("Slug wajib diisi");
  }

  if (!translations?.length) {
    throw new Error("Minimal 1 translation wajib diisi");
  }

  const existingSlug = await prisma.portfolio.findUnique({
    where: { slug },
  });

  if (existingSlug) {
    throw new Error("Slug sudah digunakan");
  }

  return prisma.portfolio.create({
    data: {
      slug,
      clientName: clientName || null,
      industry: industry || null,
      location: location || null,
      completedAt: completedAt ? new Date(completedAt) : null,
      coverImageId: coverImageId || null,
      isFeatured: isFeatured ?? false,
      isActive: isActive ?? true,
      order: order ?? 0,

      translations: {
        create: translations.map((item) => ({
          languageId: item.languageId,
          title: item.title,
          excerpt: item.excerpt || null,
          description: item.description,
          result: item.result || null,
        })),
      },

      galleries: galleryIds?.length
        ? {
            create: galleryIds.map((mediaId, index) => ({
              mediaId,
              order: index,
            })),
          }
        : undefined,

      tags: tagIds?.length
        ? {
            create: tagIds.map((tagId) => ({
              tagId,
            })),
          }
        : undefined,
    },

    include: {
      coverImage: true,
      translations: {
        include: {
          language: true,
        },
      },
      galleries: {
        include: {
          media: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      tags: {
        include: {
          tag: {
            include: {
              translations: {
                include: {
                  language: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function updatePortfolio(
  id: string,
  payload: PortfolioPayload
) {
  const {
    translations,
    galleryIds,
    tagIds,
    ...rest
  } = payload;

  if (!rest.slug?.trim()) {
    throw new Error("Slug wajib diisi");
  }

  if (!translations?.length) {
    throw new Error("Minimal 1 translation wajib diisi");
  }

  return prisma.$transaction(async (tx) => {
    const existingSlug = await tx.portfolio.findFirst({
      where: {
        slug: rest.slug,
        NOT: {
          id,
        },
      },
    });

    if (existingSlug) {
      throw new Error("Slug sudah digunakan");
    }

    await tx.portfolioTranslation.deleteMany({
      where: { portfolioId: id },
    });

    await tx.portfolioGallery.deleteMany({
      where: { portfolioId: id },
    });

    await tx.portfolioTagMap.deleteMany({
      where: { portfolioId: id },
    });

    return tx.portfolio.update({
      where: { id },
      data: {
        slug: rest.slug,
        clientName: rest.clientName || null,
        industry: rest.industry || null,
        location: rest.location || null,
        completedAt: rest.completedAt
          ? new Date(rest.completedAt)
          : null,
        coverImageId: rest.coverImageId || null,
        isFeatured: rest.isFeatured ?? false,
        isActive: rest.isActive ?? true,
        order: rest.order ?? 0,

        translations: {
          create: translations.map((item) => ({
            languageId: item.languageId,
            title: item.title,
            excerpt: item.excerpt || null,
            description: item.description,
            result: item.result || null,
          })),
        },

        galleries: galleryIds?.length
          ? {
              create: galleryIds.map((mediaId, index) => ({
                mediaId,
                order: index,
              })),
            }
          : undefined,

        tags: tagIds?.length
          ? {
              create: tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },

      include: {
        coverImage: true,
        translations: {
          include: {
            language: true,
          },
        },
        galleries: {
          include: {
            media: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        tags: {
          include: {
            tag: {
              include: {
                translations: {
                  include: {
                    language: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  });
}

export async function deletePortfolio(id: string) {
  return prisma.portfolio.delete({
    where: { id },
  });
}
