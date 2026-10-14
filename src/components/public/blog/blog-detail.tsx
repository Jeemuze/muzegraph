"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import BlogContent from "./blog-content";
import BlogViewTracker from "./blog-view-tracker";
import {
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clock,
  Copy,
  Eye,
  MessageCircle,
  User,
} from "lucide-react";

type SidePost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  readingTime: number;
  viewCount: number;
  publishedAt: string | null;
  thumbnailUrl: string | null;
};

type Props = {
  locale: string;
  post: {
    id: string;
    readingTime: number;
    viewCount: number;
    publishedAt: Date | null;
    thumbnail: { url: string } | null;
    author: { name: string | null } | null;
    featuredMedia: { id: string; name: string; url: string; type: string; mimeType: string | null }[];
  };
  translation: {
    title: string;
    excerpt: string | null;
    content: string | null;
  };
  latestPosts: SidePost[];
  popularPosts: SidePost[];
};

function formatDate(value: Date | string | null, locale: string) {
  if (!value) return null;

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    month: "short",
    day: "numeric",
    year: value instanceof Date ? "numeric" : undefined,
  }).format(new Date(value));
}

function SidePostLink({
  item,
  locale,
  index,
  mode,
}: {
  item: SidePost;
  locale: string;
  index: number;
  mode: "latest" | "popular";
}) {
  const date = formatDate(item.publishedAt, locale);

  return (
    <Link
      href={`/${locale}/blog/${item.slug}`}
      className="group block border-b py-3 last:border-b-0"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-xs font-medium tabular-nums text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-foreground">
            {item.title}
          </h3>
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-medium text-muted-foreground">
            <span>{mode === "popular" ? `${item.viewCount} views` : date}</span>
            <span>{item.readingTime} min</span>
          </div>
        </div>
        <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
      </div>
    </Link>
  );
}

export default function BlogDetail({
  locale,
  post,
  translation,
  latestPosts,
  popularPosts,
}: Props) {
  const pathname = usePathname();
  const heroRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [activeFeed, setActiveFeed] = useState<"popular" | "latest">("popular");
  const [progress, setProgress] = useState(0);
  const [showTopButton, setShowTopButton] = useState(false);
  const dateLabel = formatDate(post.publishedAt, locale);
  const feedItems = activeFeed === "popular" ? popularPosts : latestPosts;

  useEffect(() => {
    const updateProgress = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
      setShowTopButton(window.scrollY > 520);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const fullUrl = () =>
    typeof window !== "undefined" ? window.location.href : `${pathname}`;

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const el = heroRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const x = (px - 0.5) * 18;
    const y = (py - 0.5) * 18;

    el.style.setProperty("--blog-detail-x", `${x.toFixed(2)}px`);
    el.style.setProperty("--blog-detail-y", `${y.toFixed(2)}px`);
    el.style.setProperty("--blog-detail-mouse-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--blog-detail-mouse-y", `${event.clientY - rect.top}px`);
  };

  const share = (platform: string) => {
    const url = encodeURIComponent(fullUrl());
    const title = encodeURIComponent(translation.title);
    const links: Record<string, string> = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
    };

    window.open(links[platform], "_blank", "noopener,noreferrer,width=600,height=400");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(fullUrl());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main>
      <BlogViewTracker postId={post.id} />
      <div className="fixed left-0 right-0 top-16 z-40 h-px bg-transparent">
        <span
          className="block h-px origin-left bg-foreground transition-transform duration-150"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <section
        ref={heroRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => {
          const el = heroRef.current;
          if (!el) return;
          el.style.setProperty("--blog-detail-x", "0px");
          el.style.setProperty("--blog-detail-y", "0px");
        }}
        className="group relative isolate overflow-hidden border-b bg-background py-12 lg:py-20"
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20 [mask-image:linear-gradient(to_bottom,#000,transparent_86%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 [background:radial-gradient(260px_circle_at_var(--blog-detail-mouse-x,50%)_var(--blog-detail-mouse-y,45%),var(--muted),transparent_72%)] md:group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-y-0 left-[var(--blog-detail-mouse-x,50%)] hidden w-px bg-border/70 opacity-0 transition-opacity duration-200 md:block md:group-hover:opacity-70" />
        <div className="pointer-events-none absolute inset-x-0 top-[var(--blog-detail-mouse-y,50%)] hidden h-px bg-border/70 opacity-0 transition-opacity duration-200 md:block md:group-hover:opacity-70" />

        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.48fr)] lg:items-end xl:gap-14">
            <div className="max-w-5xl transition-transform duration-700 ease-out [transform:translate3d(calc(var(--blog-detail-x,0)*-.12),calc(var(--blog-detail-y,0)*-.12),0)]">
              <Link
                href={`/${locale}/blog`}
                className="mb-8 inline-flex items-center gap-2 border-b pb-1 text-xs font-medium text-muted-foreground transition-all duration-200 hover:-translate-x-0.5 hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                {locale === "en" ? "Back to articles" : "Kembali ke artikel"}
              </Link>

              <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="size-3.5" />
                  {locale === "en" ? "Article" : "Artikel"}
                </span>
                {dateLabel ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    {dateLabel}
                  </span>
                ) : null}
              </div>

              <h1 className="max-w-5xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-7xl lg:leading-[0.98]">
                {translation.title}
              </h1>

              {translation.excerpt ? (
                <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {translation.excerpt}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-y py-4 text-sm text-muted-foreground">
                {post.author?.name ? (
                  <span className="inline-flex items-center gap-2">
                    <User className="size-4" />
                    {post.author.name}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <Clock className="size-4" />
                  {post.readingTime} min read
                </span>
                <span className="inline-flex items-center gap-2">
                  <Eye className="size-4" />
                  {post.viewCount} views
                </span>
              </div>
            </div>

            <div className="relative transition-transform duration-700 ease-out [transform:translate3d(calc(var(--blog-detail-x,0)*.18),calc(var(--blog-detail-y,0)*.18),0)]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg border bg-muted shadow-sm sm:aspect-[16/10] lg:aspect-[4/5]">
                {post.thumbnail?.url ? (
                  <Image
                    src={post.thumbnail.url}
                    alt={translation.title}
                    fill
                    priority
                    unoptimized
                    sizes="(min-width: 1024px) 36rem, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-end bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] p-4">
                    <BookOpen className="size-6 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--background),transparent_42%)] opacity-50" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-background">
                  <div className="h-px flex-1 bg-background/70" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em]">
                    {locale === "en" ? "Featured image" : "Gambar utama"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-10 lg:py-16">
        <Container>
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
            <article className="min-w-0 lg:pr-4">
              <BlogContent html={translation.content || ""} />
            </article>

            <aside className="border-t pt-8 lg:sticky lg:top-24 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <div className="flex items-center justify-between border-b pb-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                  {activeFeed === "popular" ? (
                    <Eye className="size-4 text-muted-foreground" />
                  ) : (
                    <BookOpen className="size-4 text-muted-foreground" />
                  )}
                  {activeFeed === "popular"
                    ? locale === "en" ? "Popular reads" : "Artikel populer"
                    : locale === "en" ? "Latest articles" : "Artikel terbaru"}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 border-b text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveFeed("popular")}
                  className={`border-b px-3 py-2 transition-colors ${
                    activeFeed === "popular"
                      ? "border-foreground text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {locale === "en" ? "Popular" : "Populer"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFeed("latest")}
                  className={`border-b px-3 py-2 transition-colors ${
                    activeFeed === "latest"
                      ? "border-foreground text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {locale === "en" ? "Latest" : "Terbaru"}
                </button>
              </div>

              <div className="mt-2">
                {feedItems.length ? (
                  feedItems.map((item, index) => (
                    <SidePostLink
                      key={item.id}
                      item={item}
                      index={index}
                      locale={locale}
                      mode={activeFeed}
                    />
                  ))
                ) : (
                  <p className="py-4 text-sm leading-6 text-muted-foreground">
                    {locale === "en" ? "No articles yet." : "Belum ada artikel."}
                  </p>
                )}
              </div>

              <div className="mt-8 border-t pt-5">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {locale === "en" ? "Share" : "Bagikan"}
                </p>
                <div className="flex flex-col gap-2 text-sm">
                  <Button variant="ghost" size="sm" className="justify-start rounded-md px-0 hover:bg-transparent hover:underline" onClick={() => share("linkedin")}>
                    <BriefcaseBusiness className="size-4" />
                    LinkedIn
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start rounded-md px-0 hover:bg-transparent hover:underline" onClick={() => share("whatsapp")}>
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start rounded-md px-0 hover:bg-transparent hover:underline" onClick={copyLink}>
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {copied ? (locale === "en" ? "Copied" : "Tersalin") : (locale === "en" ? "Copy link" : "Salin link")}
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {post.featuredMedia.length > 0 && (
        <section className="border-t py-10 lg:py-16">
          <Container>
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              {locale === "en" ? "Media" : "Media"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {post.featuredMedia.map((media) =>
                media.type === "IMAGE" ? (
                  <div key={media.id} className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                    <Image src={media.url} alt={media.name} fill unoptimized className="object-cover" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                  </div>
                ) : media.type === "VIDEO" ? (
                  <video key={media.id} src={media.url} controls className="aspect-video w-full rounded-lg border bg-muted object-cover" />
                ) : (
                  <a key={media.id} href={media.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted">
                    <span className="text-sm font-medium text-foreground">{media.name}</span>
                  </a>
                )
              )}
            </div>
          </Container>
        </section>
      )}

      {showTopButton ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={locale === "en" ? "Back to top" : "Kembali ke atas"}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-5 right-4 z-50 size-10 rounded-md bg-background shadow-sm sm:bottom-6 sm:right-6"
        >
          <ArrowUp className="size-4" />
        </Button>
      ) : null}
    </main>
  );
}
