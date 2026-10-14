import { prisma } from "@/lib/prisma";

function safeJson(value: any) {
  if (!value) return "[]";

  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed);
  } catch {
    return JSON.stringify([
      {
        type: "paragraph",
        content: [],
      },
    ]);
  }
}

export async function getFaqById(id: string) {
  return prisma.faq.findUnique({
    where: { id },
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
}

export async function getFaqs() {
  return prisma.faq.findMany({
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
}

export async function updateFaq(id: string, data: any) {
  const { translations, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    await tx.faq.update({
      where: { id },
      data: {
        categoryId: rest.categoryId || null,
        isFeatured: rest.isFeatured ?? false,
        isActive: rest.isActive ?? true,
        order: Number(rest.order) || 0,
      },
    });

    await tx.faqTranslation.deleteMany({
      where: { faqId: id },
    });

    if (translations?.length) {
      await tx.faqTranslation.createMany({
        data: translations.map((item: any) => ({
          faqId: id,
          languageId: item.languageId,
          question: item.question || "",
          answer: safeJson(item.answer),
        })),
      });
    }

    return tx.faq.findUnique({
      where: { id },
      include: {
        category: true,
        translations: {
          include: {
            language: true,
          },
        },
      },
    });
  });
}

export async function deleteFaq(id: string) {
  return prisma.faq.delete({
    where: { id },
  });
}
