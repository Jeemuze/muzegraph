import { prisma } from "@/lib/prisma";
import { CreatePostInput } from "@/validations/blog/post.validation";

export class PostService {
  static async getAll() {
    return prisma.post.findMany({
      include: {
        translations: true,
        categories: {
          include: {
            category: {
              include: {
                translations: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: {
              include: {
                translations: true,
              },
            },
          },
        },
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getById(id: string) {
    return prisma.post.findUnique({
      where: { id },
      include: {
        translations: true,
        categories: true,
        tags: true,
      },
    });
  }

  static async create(data: CreatePostInput, authorId: string) {
    return prisma.post.create({
      data: {
        authorId,
        status: data.status,
        isFeatured: data.isFeatured,
        allowComments: data.allowComments,
        readingTime: data.readingTime,
        thumbnailId: data.featuredImage,

        translations: {
          create: data.translations,
        },

        categories: {
          create:
            data.categoryIds?.map((categoryId) => ({
              categoryId,
            })) ?? [],
        },

        tags: {
          create:
            data.tagIds?.map((tagId) => ({
              tagId,
            })) ?? [],
        },
      },
      include: {
        translations: true,
      },
    });
  }
}
