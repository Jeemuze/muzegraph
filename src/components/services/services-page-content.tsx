"use client";

import { createElement, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MousePointer2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { getLucideIcon } from "@/lib/lucide-icon";

export type ServicesPageItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
  imageUrl: string | null;
};

type Props = {
  locale: string;
  items: ServicesPageItem[];
  copy: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    cta: string;
    ctaHeading: string;
    ctaSubtitle: string;
    ctaButton: string;
  };
};

function ServiceIcon({
  name,
  className,
}: {
  name: string | null;
  className?: string;
}) {
  return createElement(getLucideIcon(name), { className });
}

export default function ServicesPageContent({ locale, items, copy }: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState(items[0]?.id);
  const active = useMemo(
    () => items.find((item) => item.id === activeId) || items[0],
    [activeId, items]
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const el = heroRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    el.style.setProperty("--services-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--services-y", `${event.clientY - rect.top}px`);
  };

  return (
    <main>
      <section
        ref={heroRef}
        onPointerMove={handlePointerMove}
        className="group relative isolate overflow-hidden border-b bg-background py-16 sm:py-20 lg:py-24"
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25 [mask-image:linear-gradient(to_bottom,#000,transparent_86%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 [background:radial-gradient(340px_circle_at_var(--services-x,50%)_var(--services-y,40%),var(--muted),transparent_72%)] md:group-hover:opacity-100" />

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
                {active ? (
                  <Button asChild variant="outline" className="h-11 rounded-md px-5">
                    <Link href={`/${locale}/services/${active.slug}`}>
                      {copy.cta}
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg border bg-background p-5 shadow-sm">
              <div className="mb-8 flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md border bg-background">
                    <ServiceIcon name={active?.icon || null} className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {locale === "en" ? "Selected service" : "Layanan dipilih"}
                    </p>
                    <p className="line-clamp-1 text-sm font-semibold text-foreground">
                      {active?.title || copy.eyebrow}
                    </p>
                  </div>
                </div>
                <MousePointer2 className="size-4 text-muted-foreground transition-transform duration-300 group-hover:rotate-12" />
              </div>

              <div className="relative aspect-[16/10] overflow-hidden rounded-md border bg-muted">
                {active?.imageUrl ? (
                  <Image
                    src={active.imageUrl}
                    alt={active.title}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 28rem, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-end bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:28px_28px] p-4">
                    <ServiceIcon name={active?.icon || null} className="size-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {locale === "en" ? "Service index" : "Index layanan"}
              </p>
              <div className="mt-5 divide-y border-y">
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActiveId(item.id)}
                    onFocus={() => setActiveId(item.id)}
                    onClick={() => setActiveId(item.id)}
                    className={`flex w-full items-center justify-between gap-4 py-3 text-left text-sm transition-colors ${
                      active?.id === item.id
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="line-clamp-1">{item.title}</span>
                    <span className="text-xs tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="divide-y border-y">
              {items.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/${locale}/services/${item.slug}`}
                  onMouseEnter={() => setActiveId(item.id)}
                  onFocus={() => setActiveId(item.id)}
                  className="group grid gap-6 py-8 transition-colors hover:bg-muted/25 sm:grid-cols-[5rem_minmax(0,1fr)] lg:grid-cols-[6rem_minmax(0,1fr)_9rem]"
                >
                  <div className="flex items-start gap-4 sm:block">
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="mt-0 flex size-11 items-center justify-center rounded-md border bg-background transition-transform duration-300 group-hover:-translate-y-1 sm:mt-5">
                      <ServiceIcon name={item.icon} className="size-5" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {item.title}
                    </h2>
                    <p className="mt-4 max-w-3xl line-clamp-3 text-sm leading-7 text-muted-foreground sm:text-base">
                      {item.description}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5" />
                        {locale === "en" ? "Discovery" : "Discovery"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5" />
                        {locale === "en" ? "Delivery" : "Delivery"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm font-medium text-foreground lg:justify-end">
                    <span className="inline-flex items-center gap-1">
                      {copy.cta}
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

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
