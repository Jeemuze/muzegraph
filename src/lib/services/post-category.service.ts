import { prisma } from "@/lib/prisma";

export async function getPostCategories() {
  return prisma.postCategory.findMany({
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

export async function getPostCategoryById(id: string) {
  return prisma.postCategory.findUnique({
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

export async function createPostCategory(data: {
  icon?: string | null;
  isActive?: boolean;
  order?: number;
  translations: {
    languageId: string;
    name: string;
    slug: string;
    description?: string | null;
  }[];
}) {
  return prisma.postCategory.create({
    data: {
      icon: data.icon,
      isActive: data.isActive ?? true,
      order: data.order ?? 0,
      translations: {
        create: data.translations,
      },
    },
    include: {
      translations: true,
    },
  });
}

export async function updatePostCategory(
  id: string,
  data: {
    icon?: string | null;
    isActive?: boolean;
    order?: number;
  }
) {
  return prisma.postCategory.update({
    where: { id },
    data,
  });
}

export async function deletePostCategory(id: string) {
  return prisma.postCategory.delete({
    where: { id },
  });
}
