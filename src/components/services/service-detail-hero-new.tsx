"use client";

import { createElement, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MousePointer2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { getLucideIcon } from "@/lib/lucide-icon";

type Props = {
  title: string;
  subtitle: string;
  badge: string;
  icon: string | null;
  locale: string;
  ctaLabel: string;
  imageUrl: string | null;
};

export default function ServiceDetailHeroNew({ title, subtitle, badge, icon, locale, ctaLabel, imageUrl }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--sy", `${e.clientY - rect.top}px`);
  };

  const Icon = getLucideIcon(icon);

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      className="group relative isolate overflow-hidden border-b bg-background py-16 sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25 [mask-image:linear-gradient(to_bottom,#000,transparent_86%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 [background:radial-gradient(340px_circle_at_var(--sx,50%)_var(--sy,40%),var(--muted),transparent_72%)] md:group-hover:opacity-100" />

      <Container>
        <Button asChild variant="ghost" className="mb-8 -ml-3 h-9 px-3 text-sm">
          <Link href={`/${locale}/services`}>
            <ArrowLeft className="size-4" />
            {badge}
          </Link>
        </Button>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.5fr)] lg:items-end">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg border bg-background shadow-sm transition-transform duration-500 group-hover:-translate-y-1">
                {createElement(Icon, { className: "size-5 text-foreground" })}
              </div>
              <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                <Sparkles className="size-3.5" />
                {badge}
              </p>
            </div>

            <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              {title.split(" ").map((word, i) => (
                <span
                  key={i}
                  className="inline-block animate-[svc-word-in_450ms_cubic-bezier(.22,1,.36,1)_both] opacity-0"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  {word}
                  {i < title.split(" ").length - 1 ? "\u00A0" : ""}
                </span>
              ))}
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg animate-[svc-fade-up_500ms_cubic-bezier(.22,1,.36,1)_300ms_both]">
              {subtitle}
            </p>

            <div className="mt-8 animate-[svc-fade-up_500ms_cubic-bezier(.22,1,.36,1)_420ms_both]">
              <Button asChild className="h-11 rounded-md px-5">
                <Link href={`/${locale}/contact`}>
                  {ctaLabel}
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
                  {createElement(Icon, { className: "size-5" })}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {locale === "en" ? "Service preview" : "Preview layanan"}
                  </p>
                  <p className="line-clamp-1 text-sm font-semibold text-foreground">
                    {title}
                  </p>
                </div>
              </div>
              <MousePointer2 className="size-4 text-muted-foreground transition-transform duration-300 group-hover:rotate-12" />
            </div>

            <div className="relative aspect-[16/10] overflow-hidden rounded-md border bg-muted">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 28rem, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full items-end bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:28px_28px] p-4">
                  {createElement(Icon, { className: "size-8 text-muted-foreground" })}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes svc-word-in {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes svc-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` }} />
    </section>
  );
}
