import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import Container from "@/components/ui/container";
import BlogPageContent from "@/components/public/blog/blog-page-content";

type Props = { params: Promise<{ locale: string }> };

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;

  const [posts, categories, dict] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: "desc" },
      include: {
        thumbnail: { select: { url: true } },
        author: { select: { name: true } },
        translations: { where: { language: { code: locale } }, select: { title: true, slug: true, excerpt: true }, take: 1 },
        categories: { include: { category: { include: { translations: { where: { language: { code: locale } }, select: { name: true, slug: true }, take: 1 } } } } },
      },
    }),
    prisma.postCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        translations: { where: { language: { code: locale } }, select: { name: true, slug: true }, take: 1 },
        _count: { select: { posts: true } },
      },
    }),
    getDictionary(locale),
  ]);

  const serializedPosts = posts.map((post) => ({
    id: post.id,
    title: post.translations[0]?.title || "",
    slug: post.translations[0]?.slug || "",
    excerpt: post.translations[0]?.excerpt || "",
    thumbnailUrl: post.thumbnail?.url || null,
    category: post.categories[0]?.category?.translations[0]?.name || null,
    categorySlug: post.categories[0]?.category?.translations[0]?.slug || null,
    readingTime: post.readingTime,
    viewCount: post.viewCount,
    publishedAt: post.publishedAt?.toISOString() || null,
  }));

  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.translations[0]?.name || "",
    slug: c.translations[0]?.slug || "",
    count: c._count.posts,
  }));

  return (
    <BlogPageContent
      locale={locale}
      posts={serializedPosts}
      categories={serializedCategories}
      copy={{
        badge: dict["blog.badge"],
        heading: dict["blog.heading"],
        subtitle: dict["blog.page_subtitle"],
        readMore: dict["blog.read_more"],
        search: dict["blog.search"],
        filterAll: dict["blog.all"],
        noResults: dict["blog.no_results"],
      }}
    />
  );
}
