import { prisma } from "@/lib/prisma";

export async function getPostTags() {
  return prisma.postTag.findMany({
    orderBy: {
      order: "asc",
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

export async function getPostTagById(id: string) {
  return prisma.postTag.findUnique({
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

export async function createPostTag(data: any) {
  const { translations, ...rest } = data;

  return prisma.postTag.create({
    data: {
      ...rest,
      translations: {
        create: translations,
      },
    },
    include: {
      translations: true,
    },
  });
}

export async function updatePostTag(
  id: string,
  data: any
) {
  const { translations, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    await tx.postTag.update({
      where: { id },
      data: rest,
    });

    await tx.postTagTranslation.deleteMany({
      where: {
        tagId: id,
      },
    });

    await tx.postTagTranslation.createMany({
      data: translations.map((item: any) => ({
        tagId: id,
        languageId: item.languageId,
        name: item.name,
        slug: item.slug,
      })),
    });

    return tx.postTag.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });
  });
}

export async function deletePostTag(id: string) {
  return prisma.postTag.delete({
    where: { id },
  });
}
