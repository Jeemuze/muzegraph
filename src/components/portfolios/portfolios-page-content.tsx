"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Briefcase, Layers, MousePointer2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";

export type PortfolioPageItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  clientName: string | null;
  industry: string | null;
  isFeatured: boolean;
  tags: { slug: string; name: string }[];
};

type Props = {
  locale: string;
  items: PortfolioPageItem[];
  copy: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    cta: string;
    ctaHeading: string;
    ctaSubtitle: string;
    ctaButton: string;
    filterAll: string;
  };
};

export default function PortfoliosPageContent({ locale, items, copy }: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const allTags = Array.from(
    new Map(items.flatMap((i) => i.tags).map((t) => [t.slug, t])).values()
  );

  const filtered = activeFilter
    ? items.filter((i) => i.tags.some((t) => t.slug === activeFilter))
    : items;

  const hovered = items.find((i) => i.id === hoveredId) || filtered[0];

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--px", `${event.clientX - rect.left}px`);
    el.style.setProperty("--py", `${event.clientY - rect.top}px`);
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
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 [background:radial-gradient(340px_circle_at_var(--px,50%)_var(--py,40%),var(--muted),transparent_72%)] md:group-hover:opacity-100" />

        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.5fr)] lg:items-end">
            <div>
              <p className="mb-6 inline-flex items-center gap-2 border-b pb-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                <Sparkles className="size-3.5" />
                {copy.eyebrow}
              </p>
              <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-7xl lg:leading-[0.98]">
                {copy.heading}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                {copy.subtitle}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-11 rounded-md px-5">
                  <Link href={`/${locale}/contact`}>
                    {copy.ctaButton}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Preview card */}
            <div className="relative overflow-hidden rounded-lg border bg-background p-5 shadow-sm">
              <div className="mb-8 flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md border bg-background">
                    <Layers className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {locale === "en" ? "Featured project" : "Proyek unggulan"}
                    </p>
                    <p className="line-clamp-1 text-sm font-semibold text-foreground">
                      {hovered?.title || copy.eyebrow}
                    </p>
                  </div>
                </div>
                <MousePointer2 className="size-4 text-muted-foreground transition-transform duration-300 group-hover:rotate-12" />
              </div>

              <div className="relative aspect-[16/10] overflow-hidden rounded-md border bg-muted">
                {hovered?.imageUrl ? (
                  <Image
                    src={hovered.imageUrl}
                    alt={hovered.title}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 28rem, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-end bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:28px_28px] p-4">
                    <Briefcase className="size-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Filter + Grid */}
      <section className="py-14 lg:py-20">
        <Container>
          {/* Tag filters */}
          {allTags.length > 0 && (
            <div className="mb-10 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveFilter(null)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                  !activeFilter
                    ? "border-foreground bg-foreground text-background"
                    : "text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {copy.filterAll}
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag.slug}
                  type="button"
                  onClick={() =>
                    setActiveFilter(activeFilter === tag.slug ? null : tag.slug)
                  }
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                    activeFilter === tag.slug
                      ? "border-foreground bg-foreground text-background"
                      : "text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}

          {/* Portfolio grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/portfolios/${item.slug}`}
                onMouseEnter={() => setHoveredId(item.id)}
                onFocus={() => setHoveredId(item.id)}
                className="group/card relative flex flex-col overflow-hidden rounded-lg border bg-background transition-shadow duration-300 hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:28px_28px]">
                      <Briefcase className="size-10 text-muted-foreground" />
                    </div>
                  )}
                  {item.isFeatured && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider backdrop-blur-sm">
                      <Sparkles className="size-3" />
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  {item.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.slug}
                          className="rounded-full border px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {item.excerpt}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    {item.clientName && (
                      <span className="text-xs text-muted-foreground">
                        {item.clientName}
                      </span>
                    )}
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-foreground">
                      {copy.cta}
                      <ArrowRight className="size-3 transition-transform duration-200 group-hover/card:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="pb-16 lg:pb-24">
        <Container>
          <div className="grid gap-8 border-t pt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {copy.ctaHeading}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                {copy.ctaSubtitle}
              </p>
            </div>
            <Button asChild className="h-11 w-fit rounded-md px-5">
              <Link href={`/${locale}/contact`}>
                {copy.ctaButton}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
