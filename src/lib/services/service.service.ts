import { prisma } from "@/lib/prisma";

/* =========================================================
   PAGE QUERIES
========================================================= */

export async function getPages() {
  return prisma.page.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      translations: {
        include: {
          language: true,
        },
      },
      sections: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

export async function getPageById(id: string) {
  return prisma.page.findUnique({
    where: { id },
    include: {
      translations: {
        include: {
          language: true,
        },
      },
      sections: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

export async function getPageBySlug(slug: string, locale?: string) {
  const page = await prisma.page.findUnique({
    where: { slug },
    include: {
      translations: {
        include: {
          language: true,
        },
      },
      sections: {
        where: {
          isActive: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!page) return null;

  const translation =
    page.translations.find((t) => t.language.code === locale) ||
    page.translations.find((t) => t.language.isDefault) ||
    page.translations[0];

  return {
    ...page,
    translation,
  };
}

/* =========================================================
   PAGE CRUD
========================================================= */

export async function createPage(data: {
  slug: string;
  template?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isHomePage?: boolean;
  publishedAt?: Date | null;
  translations: {
    languageId: string;
    title: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
  }[];
}) {
  const { translations, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    const page = await tx.page.create({
      data: {
        slug: rest.slug,
        template: rest.template || "default",
        status: rest.status || "DRAFT",
        isHomePage: rest.isHomePage ?? false,
        publishedAt: rest.publishedAt ?? null,
      },
    });

    if (translations?.length) {
      await tx.pageTranslation.createMany({
        data: translations.map((item) => ({
          pageId: page.id,
          languageId: item.languageId,
          title: item.title,
          excerpt: item.excerpt ?? null,
          metaTitle: item.metaTitle ?? null,
          metaDescription: item.metaDescription ?? null,
        })),
      });
    }

    return page;
  });
}

export async function updatePage(
  id: string,
  data: {
    slug: string;
    template?: string;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    isHomePage?: boolean;
    publishedAt?: Date | null;
    translations: {
      languageId: string;
      title: string;
      excerpt?: string;
      metaTitle?: string;
      metaDescription?: string;
    }[];
  }
) {
  const { translations, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    await tx.page.update({
      where: { id },
      data: {
        slug: rest.slug,
        template: rest.template || "default",
        status: rest.status || "DRAFT",
        isHomePage: rest.isHomePage ?? false,
        publishedAt: rest.publishedAt ?? null,
      },
    });

    await tx.pageTranslation.deleteMany({
      where: {
        pageId: id,
      },
    });

    if (translations?.length) {
      await tx.pageTranslation.createMany({
        data: translations.map((item) => ({
          pageId: id,
          languageId: item.languageId,
          title: item.title,
          excerpt: item.excerpt ?? null,
          metaTitle: item.metaTitle ?? null,
          metaDescription: item.metaDescription ?? null,
        })),
      });
    }

    return tx.page.findUnique({
      where: { id },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
        sections: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  });
}

export async function deletePage(id: string) {
  return prisma.page.delete({
    where: { id },
  });
}

/* =========================================================
   PAGE SECTION MANAGEMENT
========================================================= */

export async function addSection(
  pageId: string,
  data: {
    type: string;
    content?: any;
  }
) {
  const lastSection = await prisma.pageSection.findFirst({
    where: { pageId },
    orderBy: { order: "desc" },
  });

  const nextOrder = (lastSection?.order ?? 0) + 1;

  return prisma.pageSection.create({
    data: {
      pageId,
      type: data.type,
      content: data.content ?? {},
      isActive: true,
      order: nextOrder,
    },
  });
}

export async function updateSection(
  id: string,
  data: {
    content?: any;
    isActive?: boolean;
    order?: number;
  }
) {
  return prisma.pageSection.update({
    where: { id },
    data: {
      ...(data.content !== undefined && { content: data.content }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.order !== undefined && { order: data.order }),
    },
  });
}

export async function deleteSection(id: string) {
  return prisma.pageSection.delete({
    where: { id },
  });
}

export async function reorderSections(
  _pageId: string,
  items: { id: string }[]
) {
  return prisma.$transaction(
    items.map((item, index) =>
      prisma.pageSection.update({
        where: { id: item.id },
        data: {
          order: index + 1,
        },
      })
    )
  );
}

/* =========================================================
   SERVICE QUERIES
========================================================= */

export async function getServiceById(id: string) {
  return prisma.service.findUnique({
    where: { id },
    include: {
      translations: { include: { language: true } },
      images: { include: { media: true }, orderBy: { order: "asc" } },
    },
  });
}

/* =========================================================
   SERVICE CRUD
========================================================= */

export async function updateService(id: string, data: any) {
  const { icon, isActive, order, imageIds, translations } = data;

  return prisma.$transaction(async (tx) => {
    await tx.service.update({
      where: { id },
      data: {
        icon: icon ?? undefined,
        isActive: isActive ?? undefined,
        order: order ?? undefined,
      },
    });

    if (translations && Array.isArray(translations)) {
      await tx.serviceTranslation.deleteMany({ where: { serviceId: id } });

      const validTranslations = translations
        .filter((item: any) => item.languageId && (item.title?.trim() || item.slug?.trim()))
        .map((item: any) => ({
          serviceId: id,
          languageId: item.languageId,
          title: item.title || "",
          slug: item.slug || "",
          description: item.description || "[]",
        }));

      if (validTranslations.length > 0) {
        await tx.serviceTranslation.createMany({ data: validTranslations });
      }
    }

    if (imageIds && Array.isArray(imageIds)) {
      await tx.serviceImage.deleteMany({ where: { serviceId: id } });

      if (imageIds.length > 0) {
        await tx.serviceImage.createMany({
          data: imageIds.map((mediaId: string, index: number) => ({
            serviceId: id,
            mediaId,
            order: index,
          })),
        });
      }
    }

    return tx.service.findUnique({
      where: { id },
      include: {
        translations: { include: { language: true } },
        images: { include: { media: true }, orderBy: { order: "asc" } },
      },
    });
  });
}

export async function deleteService(id: string) {
  return prisma.service.delete({ where: { id } });
}
