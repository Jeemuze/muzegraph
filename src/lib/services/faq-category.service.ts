import { prisma } from "@/lib/prisma";

/* =========================
   TYPES
========================= */
type FaqCategoryPayload = {
  slug: string;
  isActive?: boolean;
  order?: number;
  translations: {
    languageId: string;
    name: string;
    description?: string | null;
  }[];
};

/* =========================
   GET ALL
========================= */
export async function getFaqCategories() {
  return prisma.faqCategory.findMany({
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
}

/* =========================
   GET BY ID
========================= */
export async function getFaqCategoryById(id: string) {
  return prisma.faqCategory.findUnique({
    where: { id },
    include: {
      translations: {
        include: {
          language: true,
        },
      },
    },
  });
}

/* =========================
   CREATE
========================= */
export async function createFaqCategory(
  payload: FaqCategoryPayload
) {
  const existing = await prisma.faqCategory.findUnique({
    where: { slug: payload.slug },
  });

  if (existing) {
    throw new Error("Slug sudah digunakan");
  }

  return prisma.faqCategory.create({
    data: {
      slug: payload.slug,
      isActive: payload.isActive ?? true,
      order: payload.order ?? 0,

      translations: {
        create: payload.translations.map((item) => ({
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
}

/* =========================
   UPDATE
========================= */
export async function updateFaqCategory(
  id: string,
  payload: FaqCategoryPayload
) {
  return prisma.$transaction(async (tx) => {
    await tx.faqCategory.update({
      where: { id },
      data: {
        slug: payload.slug,
        isActive: payload.isActive ?? true,
        order: payload.order ?? 0,
      },
    });

    await tx.faqCategoryTranslation.deleteMany({
      where: {
        categoryId: id,
      },
    });

    await tx.faqCategoryTranslation.createMany({
      data: payload.translations.map((item) => ({
        categoryId: id,
        languageId: item.languageId,
        name: item.name,
        description: item.description || null,
      })),
    });

    return tx.faqCategory.findUnique({
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
}

/* =========================
   DELETE
========================= */
export async function deleteFaqCategory(id: string) {
  return prisma.faqCategory.delete({
    where: { id },
  });
}
