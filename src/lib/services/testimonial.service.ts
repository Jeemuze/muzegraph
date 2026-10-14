// src/lib/services/testimonial.service.ts

import { prisma } from "@/lib/prisma";

export async function getTestimonials() {
  const data = await prisma.testimonial.findMany({
    include: {
      avatar: true,
      translations: {
        include: {
          language: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

return data.map((item) => ({
  id: item.id,
  name: item.clientName,
  company: item.companyName,
  role: item.clientRole,
  message: item.translations?.[0]?.content || "",
  rating: item.rating,
  isActive: item.isActive,
  isFeatured: item.isFeatured,
  createdAt: item.createdAt,

  image: item.avatar?.url || null,
  avatar: item.avatar,
}));
}

export async function getTestimonialById(id: string) {
  const item = await prisma.testimonial.findUnique({
    where: { id },
    include: {
      avatar: true,
      translations: {
        include: {
          language: true,
        },
      },
    },
  });

  if (!item) return null;

  return {
    id: item.id,
    clientName: item.clientName,
    clientRole: item.clientRole,
    companyName: item.companyName,
    companyUrl: item.companyUrl,
    projectName: item.projectName,
    rating: item.rating,
    avatarId: item.avatarId,
    isFeatured: item.isFeatured,
    isActive: item.isActive,
    order: item.order,
    createdAt: item.createdAt,
    avatar: item.avatar,
    translations: item.translations,
  };
}

export async function createTestimonial(data: any) {
  const { translations, ...rest } = data;

  if (rest.avatarId) {
    const mediaExists = await prisma.media.findUnique({
      where: { id: rest.avatarId },
    });

    if (!mediaExists) {
      throw new Error("Selected avatar does not exist");
    }
  }

  return prisma.$transaction(async (tx) => {
    const testimonial = await tx.testimonial.create({
      data: {
        clientName: rest.clientName,
        clientRole: rest.clientRole || null,
        companyName: rest.companyName || null,
        companyUrl: rest.companyUrl || null,
        projectName: rest.projectName || null,
        rating: rest.rating ?? 5,
        avatarId: rest.avatarId || null,
        isFeatured: rest.isFeatured ?? false,
        isActive: rest.isActive ?? true,
        order: rest.order ?? 0,
      },
    });

    if (translations?.length) {
      await tx.testimonialTranslation.createMany({
        data: translations.map((item: any) => ({
          testimonialId: testimonial.id,
          languageId: item.languageId,
          content: item.content,
        })),
      });
    }

    return tx.testimonial.findUnique({
      where: { id: testimonial.id },
      include: {
        avatar: true,
        translations: {
          include: {
            language: true,
          },
        },
      },
    });
  });
}

export async function updateTestimonial(id: string, data: any) {
  const { translations, ...rest } = data;

  if (rest.avatarId) {
    const mediaExists = await prisma.media.findUnique({
      where: { id: rest.avatarId },
    });

    if (!mediaExists) {
      throw new Error("Selected avatar does not exist");
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.testimonial.update({
      where: { id },
      data: {
        clientName: rest.clientName,
        clientRole: rest.clientRole || null,
        companyName: rest.companyName || null,
        companyUrl: rest.companyUrl || null,
        projectName: rest.projectName || null,
        rating: rest.rating ?? 5,
        avatarId: rest.avatarId || null,
        isFeatured: rest.isFeatured ?? false,
        isActive: rest.isActive ?? true,
        order: rest.order ?? 0,
      },
    });

    await tx.testimonialTranslation.deleteMany({
      where: { testimonialId: id },
    });

    if (translations?.length) {
      await tx.testimonialTranslation.createMany({
        data: translations.map((item: any) => ({
          testimonialId: id,
          languageId: item.languageId,
          content: item.content,
        })),
      });
    }

    return tx.testimonial.findUnique({
      where: { id },
      include: {
        avatar: true,
        translations: {
          include: {
            language: true,
          },
        },
      },
    });
  });
}

export async function deleteTestimonial(id: string) {
  return prisma.testimonial.delete({
    where: { id },
  });
}
