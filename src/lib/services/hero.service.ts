import { prisma } from "@/lib/prisma";

interface HeroTranslationInput {
  languageId: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  ctaPrimaryText?: string | null;
  ctaSecondaryText?: string | null;
}

interface HeroPayload {
  type?: string;
  imageId?: string | null;
  imageIds?: string[];
  videoUrl?: string | null;
  ctaPrimaryUrl?: string | null;
  ctaSecondaryUrl?: string | null;
  overlayOpacity?: number;
  isActive?: boolean;
  order?: number;
  translations: HeroTranslationInput[];
}

export async function getHeroes() {
  return prisma.hero.findMany({
    orderBy: { order: "asc" },
    include: {
      image: { select: { id: true, url: true, name: true } },
      images: { orderBy: { order: "asc" }, include: { media: { select: { id: true, url: true, name: true } } } },
      translations: { include: { language: { select: { id: true, code: true } } } },
    },
  });
}

export async function getHeroById(id: string) {
  return prisma.hero.findUnique({
    where: { id },
    include: {
      image: { select: { id: true, url: true, name: true } },
      images: { orderBy: { order: "asc" }, include: { media: { select: { id: true, url: true, name: true } } } },
      translations: { include: { language: true } },
    },
  });
}

export async function createHero(data: HeroPayload) {
  const { translations, imageIds, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    const hero = await tx.hero.create({
      data: {
        type: rest.type ?? "STATIC",
        imageId: rest.imageId ?? null,
        videoUrl: rest.videoUrl ?? null,
        ctaPrimaryUrl: rest.ctaPrimaryUrl ?? null,
        ctaSecondaryUrl: rest.ctaSecondaryUrl ?? null,
        overlayOpacity: rest.overlayOpacity ?? 40,
        isActive: rest.isActive ?? true,
        order: rest.order ?? 0,
      },
    });

    if (translations.length > 0) {
      await tx.heroTranslation.createMany({
        data: translations.map((t) => ({
          heroId: hero.id,
          languageId: t.languageId,
          title: t.title,
          subtitle: t.subtitle ?? null,
          description: t.description ?? null,
          ctaPrimaryText: t.ctaPrimaryText ?? null,
          ctaSecondaryText: t.ctaSecondaryText ?? null,
        })),
      });
    }

    if (imageIds && imageIds.length > 0) {
      await tx.heroImage.createMany({
        data: imageIds.map((mediaId, index) => ({
          heroId: hero.id,
          mediaId,
          order: index,
        })),
      });
    }

    return tx.hero.findUnique({
      where: { id: hero.id },
      include: {
        image: { select: { id: true, url: true, name: true } },
        images: { orderBy: { order: "asc" }, include: { media: { select: { id: true, url: true, name: true } } } },
        translations: { include: { language: true } },
      },
    });
  });
}

export async function updateHero(id: string, data: HeroPayload) {
  const { translations, imageIds, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    await tx.hero.update({
      where: { id },
      data: {
        type: rest.type ?? "STATIC",
        imageId: rest.imageId ?? null,
        videoUrl: rest.videoUrl ?? null,
        ctaPrimaryUrl: rest.ctaPrimaryUrl ?? null,
        ctaSecondaryUrl: rest.ctaSecondaryUrl ?? null,
        overlayOpacity: rest.overlayOpacity ?? 40,
        isActive: rest.isActive ?? true,
        order: rest.order ?? 0,
      },
    });

    await tx.heroTranslation.deleteMany({ where: { heroId: id } });

    if (translations.length > 0) {
      await tx.heroTranslation.createMany({
        data: translations.map((t) => ({
          heroId: id,
          languageId: t.languageId,
          title: t.title,
          subtitle: t.subtitle ?? null,
          description: t.description ?? null,
          ctaPrimaryText: t.ctaPrimaryText ?? null,
          ctaSecondaryText: t.ctaSecondaryText ?? null,
        })),
      });
    }

    await tx.heroImage.deleteMany({ where: { heroId: id } });

    if (imageIds && imageIds.length > 0) {
      await tx.heroImage.createMany({
        data: imageIds.map((mediaId, index) => ({
          heroId: id,
          mediaId,
          order: index,
        })),
      });
    }

    return tx.hero.findUnique({
      where: { id },
      include: {
        image: { select: { id: true, url: true, name: true } },
        images: { orderBy: { order: "asc" }, include: { media: { select: { id: true, url: true, name: true } } } },
        translations: { include: { language: true } },
      },
    });
  });
}

export async function deleteHero(id: string) {
  const hero = await prisma.hero.findUnique({ where: { id } });
  if (!hero) throw new Error("HERO_NOT_FOUND");
  return prisma.hero.delete({ where: { id } });
}
