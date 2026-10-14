"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Eye,
  MousePointer2,
  Newspaper,
  Search,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { cn } from "@/lib/utils";

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

type Props = {
  locale: string;
  posts: Post[];
  categories: Category[];
  copy: {
    badge: string;
    heading: string;
    subtitle: string;
    readMore: string;
    search: string;
    filterAll: string;
    noResults: string;
  };
};

function formatDate(value: string | null, locale: string) {
  if (!value) return null;
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function BlogPageContent({ locale, posts, categories, copy }: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchQ = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
      const matchCat = !activeCat || p.categorySlug === activeCat;
      return matchQ && matchCat;
    });
  }, [activeCat, posts, query]);

  const featured = hoveredId ? posts.find((p) => p.id === hoveredId) || filtered[0] : filtered[0];

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--bx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--by", `${event.clientY - rect.top}px`);
  };

  return (
    <main>
      {/* Hero */}
      <section
        ref={heroRef}
        onPointerMove={handlePointerMove}
        className="group relative isolate overflow-hidden border-b bg-background py-16 sm:py-20 lg:py-24"
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25 [mask-image:linear-gradient(to_bottom,#000,transparent_86%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 [background:radial-gradient(340px_circle_at_var(--bx,50%)_var(--by,40%),var(--muted),transparent_72%)] md:group-hover:opacity-100" />

        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.5fr)] lg:items-end">
            <div>
              <p className="mb-6 inline-flex items-center gap-2 border-b pb-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                <Sparkles className="size-3.5" />
                {copy.badge}
              </p>
              <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-7xl lg:leading-[0.98]">
                {copy.heading}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                {copy.subtitle}
              </p>
            </div>

            {/* Preview card */}
            <div className="relative overflow-hidden rounded-lg border bg-background p-5 shadow-sm">
              <div className="mb-8 flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md border bg-background">
                    <Newspaper className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {locale === "en" ? "Latest article" : "Artikel terbaru"}
                    </p>
                    <p className="line-clamp-1 text-sm font-semibold text-foreground">
                      {featured?.title || copy.badge}
                    </p>
                  </div>
                </div>
                <MousePointer2 className="size-4 text-muted-foreground transition-transform duration-300 group-hover:rotate-12" />
              </div>

              <div className="relative aspect-[16/10] overflow-hidden rounded-md border bg-muted">
                {featured?.thumbnailUrl ? (
                  <Image
                    src={featured.thumbnailUrl}
                    alt={featured.title}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 28rem, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-end bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:28px_28px] p-4">
                    <Newspaper className="size-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Search + Filter + Grid */}
      <section className="py-14 lg:py-20">
        <Container>
          {/* Search & filters */}
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.search}
                className="h-11 w-full rounded-md border bg-background pl-10 pr-4 text-sm text-foreground transition-shadow focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCat(null)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                  !activeCat
                    ? "border-foreground bg-foreground text-background"
                    : "text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {copy.filterAll}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCat(activeCat === cat.slug ? null : cat.slug)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                    activeCat === cat.slug
                      ? "border-foreground bg-foreground text-background"
                      : "text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Posts grid */}
          {filtered.length === 0 ? (
            <div className="rounded-lg border bg-background p-16 text-center">
              <Newspaper className="mx-auto mb-4 size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{copy.noResults}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/${locale}/blog/${post.slug}`}
                  onMouseEnter={() => setHoveredId(post.id)}
                  onFocus={() => setHoveredId(post.id)}
                  className={cn(
                    "group/card relative flex flex-col overflow-hidden rounded-lg border bg-background transition-shadow duration-300 hover:shadow-lg",
                    index === 0 && !query && !activeCat && "sm:col-span-2 lg:col-span-2"
                  )}
                >
                  <div className={cn(
                    "relative overflow-hidden bg-muted",
                    index === 0 && !query && !activeCat ? "aspect-[21/9]" : "aspect-[16/10]"
                  )}>
                    {post.thumbnailUrl ? (
                      <Image
                        src={post.thumbnailUrl}
                        alt={post.title}
                        fill
                        unoptimized
                        sizes={index === 0 ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
                        className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:28px_28px]">
                        <Newspaper className="size-10 text-muted-foreground" />
                      </div>
                    )}
                    {post.category && (
                      <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider backdrop-blur-sm">
                        {post.category}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                      {formatDate(post.publishedAt, locale) && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3" />
                          {formatDate(post.publishedAt, locale)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {post.readingTime} min
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="size-3" />
                        {post.viewCount}
                      </span>
                    </div>

                    <h3 className={cn(
                      "font-semibold tracking-tight text-foreground",
                      index === 0 && !query && !activeCat ? "text-2xl" : "text-lg"
                    )}>
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="mt-4 flex items-center border-t pt-4">
                      <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-foreground">
                        {copy.readMore}
                        <ArrowRight className="size-3 transition-transform duration-200 group-hover/card:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
