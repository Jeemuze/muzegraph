import { prisma } from "@/lib/prisma";

export class ServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

type PortfolioTagTranslationInput = {
  languageId: string;
  name: string;
};

type PortfolioTagPayload = {
  slug: string;
  isActive?: boolean;
  translations: PortfolioTagTranslationInput[];
};

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

function validateTranslations(
  translations: PortfolioTagTranslationInput[]
) {
  if (!translations?.length) {
    throw new ServiceError("Translations wajib diisi");
  }

  const valid = translations.filter(
    (item) =>
      item.languageId?.trim() &&
      item.name?.trim()
  );

  if (!valid.length) {
    throw new ServiceError("Minimal 1 translation valid");
  }

  return valid;
}

export async function getPortfolioTags() {
  return prisma.portfolioTag.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      translations: {
        include: {
          language: true,
        },
      },
      _count: {
        select: {
          portfolios: true,
        },
      },
    },
  });
}

export async function getPortfolioTagById(id: string) {
  return prisma.portfolioTag.findUnique({
    where: { id },
    include: {
      translations: {
        include: {
          language: true,
        },
      },
      _count: {
        select: {
          portfolios: true,
        },
      },
    },
  });
}

export async function createPortfolioTag(
  payload: PortfolioTagPayload
) {
  const slug = normalizeSlug(payload.slug);
  const translations = validateTranslations(payload.translations);

  const existing = await prisma.portfolioTag.findUnique({
    where: { slug },
  });

  if (existing) {
    throw new ServiceError("Slug sudah digunakan");
  }

  return prisma.portfolioTag.create({
    data: {
      slug,
      isActive: payload.isActive ?? true,
      translations: {
        create: translations.map((item) => ({
          languageId: item.languageId,
          name: item.name.trim(),
        })),
      },
    },
    include: {
      translations: {
        include: {
          language: true,
        },
      },
      _count: {
        select: {
          portfolios: true,
        },
      },
    },
  });
}

export async function updatePortfolioTag(
  id: string,
  payload: PortfolioTagPayload
) {
  const slug = normalizeSlug(payload.slug);
  const translations = validateTranslations(payload.translations);

  return prisma.$transaction(async (tx) => {
    const tag = await tx.portfolioTag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new ServiceError("Tag tidak ditemukan", 404);
    }

    const existing = await tx.portfolioTag.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (existing) {
      throw new ServiceError("Slug sudah digunakan");
    }

    await tx.portfolioTag.update({
      where: { id },
      data: {
        slug,
        isActive: payload.isActive ?? true,
      },
    });

    await tx.portfolioTagTranslation.deleteMany({
      where: { tagId: id },
    });

    await tx.portfolioTagTranslation.createMany({
      data: translations.map((item) => ({
        tagId: id,
        languageId: item.languageId,
        name: item.name.trim(),
      })),
    });

    return tx.portfolioTag.findUnique({
      where: { id },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
        _count: {
          select: {
            portfolios: true,
          },
        },
      },
    });
  });
}

export async function deletePortfolioTag(id: string) {
  const tag = await prisma.portfolioTag.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          portfolios: true,
        },
      },
    },
  });

  if (!tag) {
    throw new ServiceError("Tag tidak ditemukan", 404);
  }

  if (tag._count.portfolios > 0) {
    throw new ServiceError(
      "Tag masih digunakan oleh portfolio",
      400
    );
  }

  return prisma.portfolioTag.delete({
    where: { id },
  });
}
