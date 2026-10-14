import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

import BlogDetail from "@/components/public/blog/blog-detail";
import CommentSection from "@/components/public/blog/comment-section";
import Container from "@/components/ui/container";
import SetRouteAlternate from "@/components/providers/set-route-alternate";

import { getPublishedPostBySlug } from "@/lib/services/public-blog.service";
import { buildAlternatePaths } from "@/lib/route-alternates";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function BlogDetailPage({ params }: Props) {
  const { locale, slug } = await params;

  const post = await getPublishedPostBySlug(slug, locale);
  if (!post) return notFound();

  const translation = post.translations.find((t) => t.language.code === locale) || post.translations[0];
  if (!translation) return notFound();

  const alternatePaths = buildAlternatePaths(post, "blog");
  const [latestPosts, popularPosts] = await Promise.all([
    prisma.post.findMany({
      where: {
        id: { not: post.id },
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        translations: { some: { language: { code: locale } } },
      },
      orderBy: { publishedAt: "desc" },
      take: 4,
      select: {
        id: true,
        readingTime: true,
        viewCount: true,
        publishedAt: true,
        thumbnail: { select: { url: true } },
        translations: {
          where: { language: { code: locale } },
          select: { title: true, slug: true, excerpt: true },
          take: 1,
        },
      },
    }),
    prisma.post.findMany({
      where: {
        id: { not: post.id },
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        translations: { some: { language: { code: locale } } },
      },
      orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
      take: 4,
      select: {
        id: true,
        readingTime: true,
        viewCount: true,
        publishedAt: true,
        thumbnail: { select: { url: true } },
        translations: {
          where: { language: { code: locale } },
          select: { title: true, slug: true, excerpt: true },
          take: 1,
        },
      },
    }),
  ]);

  const toSideItems = (items: typeof latestPosts) =>
    items
      .map((item) => {
        const itemTranslation = item.translations[0];
        if (!itemTranslation) return null;

        return {
          id: item.id,
          title: itemTranslation.title,
          slug: itemTranslation.slug,
          excerpt: itemTranslation.excerpt,
          readingTime: item.readingTime,
          viewCount: item.viewCount,
          publishedAt: item.publishedAt?.toISOString() ?? null,
          thumbnailUrl: item.thumbnail?.url ?? null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

  // Fetch approved comments with replies
  const comments = post.allowComments
    ? await prisma.comment.findMany({
        where: { postId: post.id, status: "APPROVED", parentId: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          authorName: true,
          content: true,
          isAdmin: true,
          createdAt: true,
          replies: {
            where: { status: "APPROVED" },
            orderBy: { createdAt: "asc" },
            select: { id: true, authorName: true, content: true, isAdmin: true, createdAt: true },
          },
        },
      })
    : [];

  const serializedComments = comments.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    replies: c.replies.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), replies: [] })),
  }));

  return (
    <>
      <SetRouteAlternate alternatePaths={alternatePaths} />

      <BlogDetail
        locale={locale}
        post={{
          id: post.id,
          readingTime: post.readingTime,
          viewCount: post.viewCount,
          publishedAt: post.publishedAt,
          thumbnail: post.thumbnail,
          author: post.author,
          featuredMedia: post.featuredMedia.map((fm) => fm.media),
        }}
        translation={translation}
        latestPosts={toSideItems(latestPosts)}
        popularPosts={toSideItems(popularPosts)}
      />

      {post.allowComments && (
        <section className="pb-20 lg:pb-28">
          <Container>
            <div className="mx-auto max-w-3xl">
              <CommentSection
                postId={post.id}
                comments={serializedComments}
                locale={locale}
              />
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
