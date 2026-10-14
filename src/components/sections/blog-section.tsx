import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import BlogShowcase, { type BlogShowcaseItem } from "./blog-showcase";

type Props = { locale: string };

export default async function BlogSection({ locale }: Props) {
  const [posts, dict] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: "desc" },
      take: 4,
      include: {
        thumbnail: { select: { url: true } },
        author: { select: { name: true } },
        translations: { include: { language: { select: { code: true } } } },
        categories: {
          include: {
            category: {
              include: {
                translations: {
                  include: { language: { select: { code: true } } },
                },
              },
            },
          },
        },
      },
    }),
    getDictionary(locale),
  ]);

  const items: BlogShowcaseItem[] = posts
    .map((post) => {
      const t =
        post.translations.find((tr) => tr.language.code === locale) ||
        post.translations[0];
      if (!t) return null;

      const category = post.categories[0]?.category;
      const categoryName =
        category?.translations.find((tr) => tr.language.code === locale)
          ?.name || category?.translations[0]?.name || null;

      return {
        id: post.id,
        title: t.title,
        slug: t.slug,
        excerpt: t.excerpt,
        thumbnailUrl: post.thumbnail?.url ?? null,
        categoryName,
        readingTime: post.readingTime,
        publishedAt: post.publishedAt?.toISOString() ?? null,
        authorName: post.author?.name ?? null,
        isFeatured: post.isFeatured,
      };
    })
    .filter((item): item is BlogShowcaseItem => item !== null);

  if (!items.length) return null;

  return (
    <BlogShowcase
      locale={locale}
      badge={dict["blog.badge"]}
      heading={dict["blog.heading"]}
      subtitle={dict["blog.subtitle"]}
      readMore={dict["blog.read_more"]}
      viewAll={dict["blog.view_all"]}
      items={items}
    />
  );
}
