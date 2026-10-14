"use client";

import { createElement, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
};

export default function ServiceDetailHero({ title, subtitle, badge, icon, locale, ctaLabel }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number>(0);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (rafRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    rafRef.current = requestAnimationFrame(() => {
      const el = sectionRef.current;
      if (!el) { rafRef.current = 0; return; }
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${clientX - rect.left}px`);
      el.style.setProperty("--my", `${clientY - rect.top}px`);
      rafRef.current = 0;
    });
  };

  const Icon = getLucideIcon(icon);

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      className="group relative isolate overflow-hidden border-b bg-background py-20 sm:py-24 lg:py-32"
    >
      {/* Grid background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25 [mask-image:linear-gradient(to_bottom,#000,transparent_86%)]" />

      {/* Mouse glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 [background:radial-gradient(380px_circle_at_var(--mx,50%)_var(--my,40%),hsl(var(--primary)/.08),transparent_65%)] [will-change:opacity] md:group-hover:opacity-100" />

      {/* Crosshair */}
      <div className="pointer-events-none absolute inset-y-0 left-[var(--mx,50%)] hidden w-px bg-border/50 opacity-0 transition-opacity duration-200 md:block md:group-hover:opacity-50" />

      <Container>
        <div className="relative flex flex-col items-center text-center">
          {/* Icon */}
          <div className="mb-6 flex size-14 items-center justify-center rounded-lg border bg-background shadow-sm transition-transform duration-500 ease-out group-hover:-translate-y-1">
            {createElement(Icon, { className: "size-6 text-foreground" })}
          </div>

          {/* Badge */}
          <Badge variant="outline" className="mb-5 rounded-md bg-background px-2.5 py-1 text-xs font-medium">
            <Sparkles className="mr-1 size-3" />
            {badge}
          </Badge>

          {/* Title with stagger */}
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.05]">
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

          {/* Subtitle */}
          <p className="mt-6 max-w-[42rem] text-base leading-7 text-muted-foreground sm:text-lg animate-[svc-fade-up_500ms_cubic-bezier(.22,1,.36,1)_300ms_both]">
            {subtitle}
          </p>

          {/* CTA */}
          <div className="mt-8 animate-[svc-fade-up_500ms_cubic-bezier(.22,1,.36,1)_420ms_both]">
            <Button asChild className="h-11 rounded-md px-5">
              <Link href={`/${locale}/contact`}>
                {ctaLabel}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
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
