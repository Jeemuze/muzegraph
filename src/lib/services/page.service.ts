import { prisma } from "@/lib/prisma";

/* =========================================================
   TYPES
========================================================= */

type PageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

interface PageTranslationInput {
  languageId: string;
  title: string;
  excerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
}

interface PagePayload {
  slug: string;
  template?: string | null;
  status?: PageStatus;
  isHomePage?: boolean;
  publishedAt?: Date | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  structuredData?: any;
  translations: PageTranslationInput[];
}

interface SectionPayload {
  type: string;
  content?: any;
  isActive?: boolean;
}

/* =========================================================
   PAGE QUERIES
========================================================= */

export async function getPages() {
  return prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      status: true,
      isHomePage: true,
      template: true,
      updatedAt: true,
      translations: {
        select: {
          title: true,
          language: { select: { code: true } },
        },
      },
    },
  });
}

export async function getPageById(id: string) {
  return prisma.page.findUnique({
    where: { id },
    include: {
      translations: { include: { language: true } },
      sections: { orderBy: { order: "asc" } },
    },
  });
}

export async function getPageBySlug(slug: string, locale?: string) {
  const page = await prisma.page.findUnique({
    where: { slug },
    include: {
      translations: { include: { language: true } },
      sections: { where: { isActive: true }, orderBy: { order: "asc" } },
    },
  });

  if (!page) return null;

  const translation =
    page.translations.find((t) => t.language.code === locale) ||
    page.translations.find((t) => t.language.isDefault) ||
    page.translations[0];

  return { ...page, translation };
}

/* =========================================================
   PAGE CRUD
========================================================= */

export async function createPage(data: PagePayload) {
  const { translations, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    const page = await tx.page.create({
      data: {
        slug: rest.slug,
        template: rest.template ?? "default",
        status: rest.status ?? "DRAFT",
        isHomePage: rest.isHomePage ?? false,
        publishedAt: rest.publishedAt ?? null,
        canonicalUrl: rest.canonicalUrl ?? null,
        ogImage: rest.ogImage ?? null,
        structuredData: rest.structuredData ?? undefined,
      },
    });

    if (translations.length > 0) {
      await tx.pageTranslation.createMany({
        data: translations.map((item) => ({
          pageId: page.id,
          languageId: item.languageId,
          title: item.title,
          excerpt: item.excerpt ?? null,
          metaTitle: item.metaTitle ?? null,
          metaDescription: item.metaDescription ?? null,
          ogImage: item.ogImage ?? null,
          canonicalUrl: item.canonicalUrl ?? null,
        })),
      });
    }

    return tx.page.findUnique({
      where: { id: page.id },
      include: {
        translations: { include: { language: true } },
        sections: { orderBy: { order: "asc" } },
      },
    });
  });
}

export async function updatePage(id: string, data: PagePayload) {
  const { translations, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    await tx.page.update({
      where: { id },
      data: {
        slug: rest.slug,
        template: rest.template ?? "default",
        status: rest.status ?? "DRAFT",
        isHomePage: rest.isHomePage ?? false,
        publishedAt: rest.publishedAt ?? null,
        canonicalUrl: rest.canonicalUrl ?? null,
        ogImage: rest.ogImage ?? null,
        structuredData: rest.structuredData ?? undefined,
      },
    });

    await tx.pageTranslation.deleteMany({ where: { pageId: id } });

    if (translations.length > 0) {
      await tx.pageTranslation.createMany({
        data: translations.map((item) => ({
          pageId: id,
          languageId: item.languageId,
          title: item.title,
          excerpt: item.excerpt ?? null,
          metaTitle: item.metaTitle ?? null,
          metaDescription: item.metaDescription ?? null,
          ogImage: item.ogImage ?? null,
          canonicalUrl: item.canonicalUrl ?? null,
        })),
      });
    }

    return tx.page.findUnique({
      where: { id },
      include: {
        translations: { include: { language: true } },
        sections: { orderBy: { order: "asc" } },
      },
    });
  });
}

export async function deletePage(id: string) {
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) throw new Error("PAGE_NOT_FOUND");
  return prisma.page.delete({ where: { id } });
}

/* =========================================================
   PAGE SECTION MANAGEMENT
========================================================= */

export async function addSection(pageId: string, data: SectionPayload) {
  const lastSection = await prisma.pageSection.findFirst({
    where: { pageId },
    orderBy: { order: "desc" },
  });

  return prisma.pageSection.create({
    data: {
      pageId,
      type: data.type,
      content: data.content ?? {},
      isActive: data.isActive ?? true,
      order: (lastSection?.order ?? 0) + 1,
    },
  });
}

export async function updateSection(
  id: string,
  data: { content?: any; isActive?: boolean; order?: number }
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
  return prisma.pageSection.delete({ where: { id } });
}

export async function reorderSections(pageId: string, items: { id: string }[]) {
  return prisma.$transaction(
    items.map((item, index) =>
      prisma.pageSection.update({
        where: { id: item.id, pageId },
        data: { order: index + 1 },
      })
    )
  );
}
