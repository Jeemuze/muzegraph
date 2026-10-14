"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Newspaper,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BlogShowcaseItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnailUrl: string | null;
  categoryName: string | null;
  readingTime: number;
  publishedAt: string | null;
  authorName: string | null;
  isFeatured: boolean;
};

type Props = {
  locale: string;
  badge: string;
  heading: string;
  subtitle: string;
  readMore: string;
  viewAll: string;
  items: BlogShowcaseItem[];
};

function formatDate(value: string | null, locale: string) {
  if (!value) return null;

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function PostVisual({
  post,
  priority = false,
}: {
  post: BlogShowcaseItem;
  priority?: boolean;
}) {
  if (post.thumbnailUrl) {
    return (
      <Image
        src={post.thumbnailUrl}
        alt={post.title}
        fill
        priority={priority}
        sizes={priority ? "(min-width: 1024px) 48vw, 100vw" : "(min-width: 1024px) 25vw, 100vw"}
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

export default function BlogShowcase({
  locale,
  badge,
  heading,
  subtitle,
  readMore,
  viewAll,
  items,
}: Props) {
  const [activeId, setActiveId] = useState(items[0]?.id);
  const sectionRef = useRef<HTMLDivElement>(null);
  const active = useMemo(
    () => items.find((item) => item.id === activeId) || items[0],
    [activeId, items]
  );

  if (!items.length || !active) return null;

  const activeDate = formatDate(active.publishedAt, locale);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = sectionRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;

    el.style.setProperty("--blog-x", `${x.toFixed(2)}px`);
    el.style.setProperty("--blog-y", `${y.toFixed(2)}px`);
  };

  return (
    <div ref={sectionRef} onPointerMove={handlePointerMove} className="relative">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_auto] lg:items-end">
        <div>
          <Badge variant="outline" className="mb-4 rounded-md bg-background px-2.5 py-1 text-xs font-medium">
            <Sparkles className="mr-1 size-3" />
            {badge}
          </Badge>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {subtitle}
          </p>
        </div>

        <Button asChild variant="outline" className="hidden w-fit rounded-md bg-background/80 lg:inline-flex">
          <Link href={`/${locale}/blog`}>
            {viewAll}
            <ArrowRight data-icon="inline-end" className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Link
          href={`/${locale}/blog/${active.slug}`}
          className="group relative min-h-[32rem] overflow-hidden rounded-lg border bg-background shadow-sm outline-none transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 animate-[blog-card-in_560ms_ease-out_both]"
        >
          <div className="absolute inset-0">
            <PostVisual post={active} priority />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/78 to-background/10" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:36px_36px] opacity-15 [mask-image:linear-gradient(to_bottom,transparent,#000)]" />

          <div className="relative flex h-full flex-col justify-end p-5 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {active.categoryName ? (
                <Badge variant="secondary" className="rounded-md text-[10px] font-medium">
                  {active.categoryName}
                </Badge>
              ) : null}
              {active.isFeatured ? (
                <Badge variant="outline" className="rounded-md bg-background/80 text-[10px] font-medium backdrop-blur">
                  Featured
                </Badge>
              ) : null}
            </div>

            <h3
              key={active.id}
              className="max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl animate-[blog-copy-in_360ms_ease-out_both]"
            >
              {active.title}
            </h3>

            {active.excerpt ? (
              <p
                key={`${active.id}-excerpt`}
                className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base animate-[blog-copy-in_420ms_ease-out_80ms_both]"
              >
                {active.excerpt}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
              {activeDate ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  {activeDate}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {active.readingTime} min
              </span>
              {active.authorName ? <span>{active.authorName}</span> : null}
            </div>

            <span className="mt-7 inline-flex items-center gap-1 text-sm font-medium text-foreground">
              {readMore}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {items.map((post, index) => {
            const isActive = post.id === active.id;
            const date = formatDate(post.publishedAt, locale);

            return (
              <Link
                key={post.id}
                href={`/${locale}/blog/${post.slug}`}
                onMouseEnter={() => setActiveId(post.id)}
                onFocus={() => setActiveId(post.id)}
                className={cn(
                  "group grid min-h-32 grid-cols-[6rem_minmax(0,1fr)] gap-3 overflow-hidden rounded-lg border bg-background p-2 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none animate-[blog-card-in_520ms_ease-out_both]",
                  isActive && "border-foreground/20 bg-muted/40"
                )}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="relative overflow-hidden rounded-md bg-muted">
                  <PostVisual post={post} />
                </div>

                <div className="flex min-w-0 flex-col justify-between py-1 pr-1">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                      <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                      {post.categoryName ? (
                        <span className="truncate">{post.categoryName}</span>
                      ) : null}
                    </div>
                    <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                      {post.title}
                    </h4>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{date || `${post.readingTime} min`}</span>
                    <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-1" />
                  </div>

                  <span
                    className={cn(
                      "mt-2 block h-px origin-left bg-muted-foreground/25",
                      isActive ? "animate-[blog-progress_3600ms_ease-in-out_infinite] bg-foreground" : ""
                    )}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <Button asChild variant="outline" className="mt-8 w-full rounded-md bg-background/80 sm:w-fit lg:hidden">
        <Link href={`/${locale}/blog`}>
          {viewAll}
          <ArrowRight data-icon="inline-end" className="size-4" />
        </Link>
      </Button>

      <div className="pointer-events-none absolute -right-2 top-28 hidden rounded-md border bg-background/85 px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur lg:block animate-[blog-float_4s_ease-in-out_infinite] [transform:translate3d(calc(var(--blog-x,0)*.2),calc(var(--blog-y,0)*.2),0)]">
        editorial
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blog-card-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blog-copy-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blog-progress {
          0%,
          100% {
            transform: scaleX(0.2);
            opacity: 0.4;
          }
          50% {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        @keyframes blog-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      ` }} />
    </div>
  );
}
