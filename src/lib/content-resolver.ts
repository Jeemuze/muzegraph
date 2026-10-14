import { prisma } from "@/lib/prisma";
import { getFallbackLocale } from "@/lib/locale";

type ResolveContentParams = {
  type: "service";
  slug: string;
  locale: string;
};

export async function resolveContent({
  type,
  slug,
  locale,
}: ResolveContentParams) {
  const safeLocale = getFallbackLocale(locale);

  switch (type) {
    case "service":
      return await prisma.service.findFirst({
        where: {
          translations: {
            some: {
              slug,
              language: {
                code: safeLocale,
              },
            },
          },
        },
        include: {
          images: {
            include: {
              media: true,
            },
            orderBy: {
              order: "asc",
            },
          },
          translations: {
            include: {
              language: true,
            },
          },
        },
      });

    default:
      return null;
  }
}
