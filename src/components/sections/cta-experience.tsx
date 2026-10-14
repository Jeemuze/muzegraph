"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  MessageCircle,
  MousePointer2,
  Rocket,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  locale: string;
  heading: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel: string;
};

const steps = ["Brief", "Prototype", "Launch"];
const copy = {
  id: {
    badge: "Partner peluncuran digital",
    panelTitle: "Ritme proyek",
    panelSubtitle: "Dari obrolan pertama sampai rilis pertama",
    steps: ["Brief", "Prototype", "Rilis"],
    highlights: ["Sprint 2 minggu", "Scope jelas", "CMS siap"],
    note: "Slot konsultasi minggu ini tersedia.",
  },
  en: {
    badge: "Digital launch partner",
    panelTitle: "Project pulse",
    panelSubtitle: "From first chat to first launch",
    steps,
    highlights: ["2 week sprint", "Clear scope", "CMS ready"],
    note: "Consultation slots are available this week.",
  },
};

export default function CtaExperience({
  locale,
  heading,
  subtitle,
  primaryLabel,
  secondaryLabel,
}: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const content = locale === "en" ? copy.en : copy.id;
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--cta-mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--cta-mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className="group/cta relative overflow-hidden rounded-lg border bg-background p-5 shadow-sm sm:p-8"
    >
      {/* Grid background - consistent with other sections */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:36px_36px] opacity-20 [mask-image:linear-gradient(to_bottom,#000,transparent_88%)]" />

      {/* Mouse glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 [background:radial-gradient(350px_circle_at_var(--cta-mouse-x,50%)_var(--cta-mouse-y,50%),hsl(var(--primary)/.08),transparent_65%)] group-hover/cta:opacity-100" />

      <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-10">
        {/* Left content */}
        <div className="max-w-2xl">
          <Badge variant="outline" className="mb-5 rounded-md bg-background px-2.5 py-1 text-xs font-medium">
            <Sparkles className="mr-1 size-3" />
            {content.badge}
          </Badge>

          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="group/btn h-10 rounded-md px-5">
              <Link href={`/${locale}/contact`}>
                {primaryLabel}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-10 rounded-md px-5">
              <Link href={`/${locale}/services`}>
                <MessageCircle className="size-4" />
                {secondaryLabel}
              </Link>
            </Button>
          </div>
        </div>

        {/* Right panel */}
        <div className="relative">
          <div className="flex min-h-[20rem] flex-col justify-between overflow-hidden rounded-lg border bg-background p-4 shadow-xs sm:p-5">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{content.panelTitle}</p>
                <p className="mt-1 text-xs text-muted-foreground">{content.panelSubtitle}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-md border bg-muted/40">
                <Rocket className="size-4 text-foreground" />
              </div>
            </div>

            <div className="py-6">
              <div className="relative mx-auto flex max-w-sm items-center justify-between">
                <span className="absolute left-6 right-6 top-5 h-px bg-border" />
                <span
                  className="absolute left-6 top-5 h-px origin-left bg-foreground transition-transform duration-500"
                  style={{
                    right: "1.5rem",
                    transform: `scaleX(${activeStep / (content.steps.length - 1)})`,
                  }}
                />
                {content.steps.map((step, index) => {
                  const isActive = activeStep === index;
                  const isDone = activeStep > index;

                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => setActiveStep(index)}
                      onMouseEnter={() => setActiveStep(index)}
                      className="group/step relative z-10 flex w-16 flex-col items-center gap-2 text-center focus-visible:outline-none"
                    >
                      <span
                        className={cn(
                          "flex size-10 items-center justify-center rounded-md border text-xs font-bold shadow-xs transition-all duration-300 group-hover/step:-translate-y-0.5",
                          isActive || isDone
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-muted-foreground"
                        )}
                      >
                        {isDone ? <Check className="size-4" /> : index + 1}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold transition-colors",
                          isActive ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {content.highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-md border bg-muted/30 p-3 text-xs font-medium text-foreground shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-background"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-md border bg-background/80 p-3 text-xs text-muted-foreground shadow-xs">
              <MousePointer2 className="size-4 text-foreground" />
              <span>{content.note}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
