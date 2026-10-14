"use client";

import { createElement, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLucideIcon } from "@/lib/lucide-icon";
import { cn } from "@/lib/utils";

export type ServiceShowcaseItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
};

type Props = {
  locale: string;
  badge: string;
  heading: string;
  subtitle: string;
  cta: string;
  items: ServiceShowcaseItem[];
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

export default function ServicesShowcase({
  locale,
  badge,
  heading,
  subtitle,
  cta,
  items,
}: Props) {
  const [activeId, setActiveId] = useState(items[0]?.id);
  const active = useMemo(
    () => items.find((item) => item.id === activeId) || items[0],
    [activeId, items]
  );

  if (!items.length || !active) return null;

  return (
    <div className="relative">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
        <div>
          <Badge variant="outline" className="mb-4 rounded-md bg-background px-2.5 py-1 text-xs font-medium">
            {badge}
          </Badge>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {subtitle}
          </p>
        </div>

        <div className="hidden justify-end lg:flex">
          <div className="group/preview relative w-full max-w-md overflow-hidden rounded-lg border bg-background p-5 shadow-sm">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-25 [mask-image:linear-gradient(to_bottom,#000,transparent_85%)]" />
            <div className="relative">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-md border bg-background shadow-xs transition-transform duration-300 group-hover/preview:-translate-y-1">
                  <ServiceIcon name={active.icon} className="size-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {String(items.findIndex((item) => item.id === active.id) + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                {active.title}
              </h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {active.description}
              </p>

              <Button asChild variant="outline" className="mt-6 rounded-md bg-background/80">
                <Link href={`/${locale}/services/${active.slug}`}>
                  {cta}
                  <ArrowRight data-icon="inline-end" className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((service, index) => {
          const isActive = service.id === active.id;

          return (
            <Link
              key={service.id}
              href={`/${locale}/services/${service.slug}`}
              onMouseEnter={() => setActiveId(service.id)}
              onFocus={() => setActiveId(service.id)}
              className={cn(
                "group relative min-h-56 overflow-hidden rounded-lg border bg-background p-5 shadow-xs transition-all duration-300 animate-[service-card-in_500ms_ease-out_both]",
                "hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md focus-visible:-translate-y-1 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                isActive && "border-foreground/20 bg-muted/35"
              )}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-foreground transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100" />
              <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full border bg-muted/40 opacity-0 transition-all duration-500 group-hover:right-4 group-hover:top-4 group-hover:opacity-100" />

              <div className="relative flex h-full flex-col">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex size-10 items-center justify-center rounded-md border bg-background shadow-xs transition-transform duration-300 group-hover:-translate-y-1">
                    <ServiceIcon name={service.icon} className="size-5" />
                  </div>
                  <span className="rounded-md border bg-background px-2 py-1 text-xs font-medium tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {service.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {service.description}
                </p>

                <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-foreground">
                  {cta}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground lg:hidden">
        <Sparkles className="size-3.5" />
        <span>{active.title}</span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes service-card-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      ` }} />
    </div>
  );
}
