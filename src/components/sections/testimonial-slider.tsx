"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
} from "lucide-react";

type Testimonial = {
  id: string;
  clientName: string;
  clientRole: string | null;
  companyName: string | null;
  companyUrl: string | null;
  projectName: string | null;
  rating: number;
  avatarUrl: string | null;
  content: string;
};

type Props = { items: Testimonial[] };

function ClientAvatar({ item }: { item: Testimonial }) {
  if (item.avatarUrl) {
    return (
      <Image
        src={item.avatarUrl}
        alt={item.clientName}
        width={44}
        height={44}
        unoptimized
        className="size-11 rounded-full object-cover ring-1 ring-border"
      />
    );
  }

  return (
    <div className="flex size-11 items-center justify-center rounded-full border bg-muted text-sm font-semibold text-foreground">
      {item.clientName.charAt(0)}
    </div>
  );
}

function Rating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} star rating`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "size-3.5",
            index < value ? "fill-foreground text-foreground" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

export default function TestimonialSlider({ items }: Props) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => setCurrent((index + items.length) % items.length),
    [items.length]
  );
  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;

    const timer = window.setTimeout(next, 6500);
    return () => window.clearTimeout(timer);
  }, [current, isPaused, items.length, next]);

  if (!items.length) return null;

  const item = items[current];

  return (
    <div
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]"
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
    >
      <div
        className="group relative min-h-[27rem] overflow-hidden rounded-lg border bg-background p-5 shadow-sm sm:p-8"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:36px_36px] opacity-20 [mask-image:linear-gradient(to_bottom,#000,transparent_85%)]" />
        <div className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-md border bg-background shadow-xs">
          <Quote className="size-5 text-muted-foreground" />
        </div>

        <div className="relative flex h-full flex-col justify-between gap-10">
          <div>
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <Rating value={item.rating} />
              {item.projectName ? (
                <span className="rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
                  {item.projectName}
                </span>
              ) : null}
            </div>

            <blockquote
              key={item.id}
              className="max-w-4xl text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl"
            >
              &ldquo;{item.content}&rdquo;
            </blockquote>
          </div>

          <div className="flex flex-col gap-5 border-t pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3">
              <ClientAvatar item={item} />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {item.clientName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {[item.clientRole, item.companyName].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>

            {item.companyUrl ? (
              <Button asChild variant="outline" size="sm" className="w-fit rounded-md bg-background/80">
                <a href={item.companyUrl} target="_blank" rel="noreferrer">
                  Visit company
                  <ArrowUpRight data-icon="inline-end" className="size-3.5" />
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {items.length > 1 ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 lg:flex lg:justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className="h-9 w-full rounded-md lg:w-9"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className="h-9 w-full rounded-md lg:w-9"
              aria-label="Next testimonial"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {items.map((testimonial, index) => {
              const isActive = testimonial.id === item.id;

              return (
                <button
                  key={testimonial.id}
                  type="button"
                  onClick={() => goTo(index)}
                  onMouseEnter={() => setCurrent(index)}
                  className={cn(
                    "group rounded-lg border bg-background p-3 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                    isActive && "border-foreground/20 bg-muted/40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <ClientAvatar item={testimonial} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {testimonial.clientName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {testimonial.companyName || testimonial.projectName || testimonial.clientRole}
                      </p>
                    </div>
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <span
                    className={cn(
                      "mt-3 block h-px origin-left bg-muted-foreground/25 transition-colors duration-200",
                      isActive && "bg-foreground"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

    </div>
  );
}
