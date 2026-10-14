"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Eye,
  Newspaper,
  Search,
  Sparkles,
} from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl: string | null;
  category: string | null;
  categorySlug: string | null;
  readingTime: number;
  viewCount: number;
  publishedAt: string | null;
};

type Category = { id: string; name: string; slug: string; count: number };
type RecentPost = { id: string; title: string; slug: string; thumbnailUrl: string | null; publishedAt: string | null };

type Props = {
  locale: string;
  posts: Post[];
  categories: Category[];
  recentPosts: RecentPost[];
};

function formatDate(value: string | null, locale: string) {
  if (!value) return null;

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function PostVisual({ post, priority = false }: { post: Post; priority?: boolean }) {
  if (post.thumbnailUrl) {
    return (
      <Image
        src={post.thumbnailUrl}
        alt={post.title}
        fill
        priority={priority}
        unoptimized
        sizes={priority ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 18rem, 100vw"}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    );
  }

  return (
    <div className="flex size-full items-end bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:28px_28px] p-4">
      <Newspaper className="size-6 text-muted-foreground" />
    </div>
  );
}

export default function BlogListContent({ locale, posts, categories, recentPosts }: Props) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [activeId, setActiveId] = useState(posts[0]?.id);
  const sectionRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchQuery =
        !normalizedQuery ||
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.excerpt.toLowerCase().includes(normalizedQuery);
      const matchCat = !activeCat || post.categorySlug === activeCat;

      return matchQuery && matchCat;
    });
  }, [activeCat, posts, query]);

  const active = useMemo(
    () => filtered.find((post) => post.id === activeId) || filtered[0],
    [activeId, filtered]
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = sectionRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;

    el.style.setProperty("--blog-list-x", `${x.toFixed(2)}px`);
    el.style.setProperty("--blog-list-y", `${y.toFixed(2)}px`);
  };

  const clearFilters = () => {
    setQuery("");
    setActiveCat(null);
    setActiveId(posts[0]?.id);
  };

  const selectCategory = (slug: string | null) => {
    setActiveCat(slug);
    const next = slug ? posts.find((post) => post.categorySlug === slug) : posts[0];
    setActiveId(next?.id ?? "");
  };

  return (
    <div ref={sectionRef} onPointerMove={handlePointerMove} className="relative">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={locale === "en" ? "Search articles..." : "Cari artikel..."}
            className="h-11 w-full rounded-md border bg-background pl-10 pr-4 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectCategory(null)}
            className={cn(
              "rounded-md border px-3 py-2 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20",
              !activeCat ? "bg-foreground text-background" : "bg-background text-muted-foreground hover:bg-muted/30"
            )}
          >
            {locale === "en" ? "All" : "Semua"} · {posts.length}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => selectCategory(category.slug)}
              className={cn(
                "rounded-md border px-3 py-2 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20",
                activeCat === category.slug
                  ? "bg-foreground text-background"
                  : "bg-background text-muted-foreground hover:bg-muted/30"
              )}
            >
              {category.name} · {category.count}
            </button>
          ))}
        </div>
      </div>

      {(query || activeCat) ? (
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{locale === "en" ? "Filtered by" : "Filter"}</span>
          {query ? <Badge variant="secondary" className="rounded-md">&ldquo;{query}&rdquo;</Badge> : null}
          {activeCat ? (
            <Badge variant="secondary" className="rounded-md">
              {categories.find((category) => category.slug === activeCat)?.name}
            </Badge>
          ) : null}
          <button type="button" onClick={clearFilters} className="font-medium underline underline-offset-4 hover:text-foreground">
            {locale === "en" ? "Clear" : "Hapus"}
          </button>
        </div>
      ) : null}

      {!active ? (
        <div className="mt-10 rounded-lg border bg-background p-12 text-center shadow-sm">
          <p className="text-muted-foreground">
            {locale === "en" ? "No articles found." : "Artikel tidak ditemukan."}
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <Link
            href={`/${locale}/blog/${active.slug}`}
            className="group relative min-h-[34rem] overflow-hidden rounded-lg border bg-background shadow-sm outline-none transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <div className="absolute inset-0">
              <PostVisual post={active} priority />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/78 to-background/10" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:36px_36px] opacity-15 [mask-image:linear-gradient(to_bottom,transparent,#000)]" />

            <div className="relative flex h-full flex-col justify-end p-5 sm:p-8">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {active.category ? (
                  <Badge variant="secondary" className="rounded-md text-[10px] font-medium">
                    {active.category}
                  </Badge>
                ) : null}
                <Badge variant="outline" className="rounded-md bg-background/80 text-[10px] font-medium backdrop-blur">
                  <Sparkles className="mr-1 size-3" />
                  {locale === "en" ? "Selected" : "Pilihan"}
                </Badge>
              </div>

              <h2 key={active.id} className="max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl animate-[blog-list-copy_320ms_ease-out_both]">
                {active.title}
              </h2>

              {active.excerpt ? (
                <p key={`${active.id}-excerpt`} className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base animate-[blog-list-copy_380ms_ease-out_70ms_both]">
                  {active.excerpt}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
                {formatDate(active.publishedAt, locale) ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    {formatDate(active.publishedAt, locale)}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  {active.readingTime} min
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="size-3.5" />
                  {active.viewCount}
                </span>
              </div>

              <span className="mt-7 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                {locale === "en" ? "Read article" : "Baca artikel"}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {filtered.map((post, index) => {
              const isActive = post.id === active.id;
              const date = formatDate(post.publishedAt, locale);

              return (
                <Link
                  key={post.id}
                  href={`/${locale}/blog/${post.slug}`}
                  onMouseEnter={() => setActiveId(post.id)}
                  onFocus={() => setActiveId(post.id)}
                  className={cn(
                    "group grid min-h-32 grid-cols-[6rem_minmax(0,1fr)] gap-3 overflow-hidden rounded-lg border bg-background p-2 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                    isActive && "border-foreground/20 bg-muted/40"
                  )}
                >
                  <div className="relative overflow-hidden rounded-md bg-muted">
                    <PostVisual post={post} />
                  </div>

                  <div className="flex min-w-0 flex-col justify-between py-1 pr-1">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                        <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                        {post.category ? <span className="truncate">{post.category}</span> : null}
                      </div>
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                        {post.title}
                      </h3>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{date || `${post.readingTime} min`}</span>
                      <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-1" />
                    </div>

                    <span
                      className={cn(
                        "mt-2 block h-px origin-left bg-muted-foreground/25",
                        isActive && "animate-[blog-list-progress_3600ms_ease-in-out_infinite] bg-foreground"
                      )}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {recentPosts.length ? (
        <div className="mt-12 border-t pt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-foreground">
              {locale === "en" ? "Fresh from the journal" : "Terbaru dari jurnal"}
            </h2>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {recentPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/${locale}/blog/${post.slug}`}
                className="group rounded-lg border bg-background p-3 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-muted/30"
              >
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                  {post.title}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  {formatDate(post.publishedAt, locale)}
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute -right-2 top-36 hidden rounded-md border bg-background/85 px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur lg:block [transform:translate3d(calc(var(--blog-list-x,0)*.2),calc(var(--blog-list-y,0)*.2),0)]">
        editorial
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blog-list-copy {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blog-list-progress {
          0%,
          100% {
            transform: scaleX(0.2);
          }
          50% {
            transform: scaleX(1);
          }
        }
      ` }} />
    </div>
  );
}
