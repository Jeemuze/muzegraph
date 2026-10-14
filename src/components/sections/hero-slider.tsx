"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, MousePointer2, Sparkles } from "lucide-react";

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  ctaPrimaryText: string | null;
  ctaPrimaryUrl: string | null;
  ctaSecondaryText: string | null;
  ctaSecondaryUrl: string | null;
  imageUrl: string | null;
  imageUrls?: string[];
  videoUrl: string | null;
  type: string;
  overlayOpacity: number;
};

type Props = { slides: HeroSlide[] };

function StaggerWords({ text, slideId }: { text: string; slideId: string }) {
  const words = text.split(" ");
  return (
    <span key={slideId} className="inline">
      {words.map((word, i) => (
        <span
          key={`${slideId}-${i}`}
          className="inline-block animate-[hero-word-in_450ms_cubic-bezier(.22,1,.36,1)_both] opacity-0"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}

export default function HeroSlider({ slides }: Props) {
  const [current, setCurrent] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number>(0);

  const goTo = useCallback((index: number) => {
    setCurrent((index + slides.length) % slides.length);
    setImgIndex(0);
  }, [slides.length]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = window.setTimeout(next, 7000);
    return () => window.clearTimeout(timer);
  }, [current, isPaused, next, slides.length]);

  // Cycle through images within a SLIDER type slide
  useEffect(() => {
    const slide = slides[current];
    const urls = slide?.imageUrls;
    if (!urls || urls.length <= 1) return;
    const timer = window.setInterval(() => {
      setImgIndex((prev) => (prev + 1) % urls.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [current, slides]);

  if (!slides.length) return null;

  const slide = slides[current];
  const displayImageUrl = slide.imageUrls && slide.imageUrls.length > 0
    ? slide.imageUrls[imgIndex % slide.imageUrls.length]
    : slide.imageUrl;

  // Throttled pointer move via rAF for performance
  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (rafRef.current) return;
    const clientX = event.clientX;
    const clientY = event.clientY;

    rafRef.current = requestAnimationFrame(() => {
      const el = sectionRef.current;
      if (!el) { rafRef.current = 0; return; }

      const rect = el.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;
      const x = (px - 0.5) * 28;
      const y = (py - 0.5) * 28;
      const rotateX = (0.5 - py) * 10;
      const rotateY = (px - 0.5) * 12;

      el.style.setProperty("--hx", `${x.toFixed(1)}px`);
      el.style.setProperty("--hy", `${y.toFixed(1)}px`);
      el.style.setProperty("--hrx", `${rotateX.toFixed(1)}deg`);
      el.style.setProperty("--hry", `${rotateY.toFixed(1)}deg`);
      el.style.setProperty("--mx", `${clientX - rect.left}px`);
      el.style.setProperty("--my", `${clientY - rect.top}px`);

      rafRef.current = 0;
    });
  };

  const resetPointer = () => {
    const el = sectionRef.current;
    if (!el) return;
    setIsPaused(false);
    el.style.setProperty("--hx", "0px");
    el.style.setProperty("--hy", "0px");
    el.style.setProperty("--hrx", "0deg");
    el.style.setProperty("--hry", "0deg");
  };

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={resetPointer}
      className="group relative isolate overflow-hidden border-b bg-background"
    >
      {/* Grid background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.2] [mask-image:linear-gradient(to_bottom,#000,transparent_85%)]" />

      {/* Mouse glow - GPU composited */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 [background:radial-gradient(400px_circle_at_var(--mx,50%)_var(--my,45%),hsl(var(--primary)/.1),transparent_65%)] [will-change:opacity] md:group-hover:opacity-100" />

      {/* Single crosshair - vertical */}
      <div className="pointer-events-none absolute inset-y-0 left-[var(--mx,50%)] hidden w-px bg-border/50 opacity-0 transition-opacity duration-200 md:block md:group-hover:opacity-60" />

      {/* Floating shape - parallax */}
      <div className="pointer-events-none absolute left-[8%] top-[18%] size-40 rounded-full border opacity-30 [transform:translate3d(calc(var(--hx,0)*1.6),calc(var(--hy,0)*1.6),0)] [transition:transform_600ms_ease-out]" />
      <div className="pointer-events-none absolute right-[16%] top-[22%] size-24 rounded-md border opacity-30 [transform:translate3d(calc(var(--hx,0)*-1.2),calc(var(--hy,0)*-1.2),0)_rotate(12deg)] [transition:transform_600ms_ease-out]" />

      {/* Animated accent lines */}
      <div className="pointer-events-none absolute left-4 top-20 hidden h-20 w-px bg-border md:block animate-[hero-line_2.4s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute bottom-28 right-[8%] hidden h-px w-24 bg-border md:block animate-[hero-line-x_2.8s_ease-in-out_infinite]" />

      <div className="mx-auto grid min-h-[80svh] max-w-7xl items-center gap-10 px-4 pb-20 pt-12 sm:px-6 lg:min-h-[calc(100svh-3.5rem)] lg:grid-cols-[minmax(0,1fr)_26rem] lg:px-8 lg:pb-28 lg:pt-16 lg:py-20">
        {/* Text content - subtle parallax */}
        <div className="max-w-3xl animate-[hero-content-in_520ms_ease-out_both] [transform:translate3d(calc(var(--hx,0)*-.12),calc(var(--hy,0)*-.12),0)] [transition:transform_600ms_ease-out]">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {slide.subtitle ? (
              <Badge variant="outline" className="rounded-md bg-background/80 px-2.5 py-1 text-xs font-medium backdrop-blur transition-transform duration-300 hover:-translate-y-0.5">
                <Sparkles className="mr-1 size-3" />
                {slide.subtitle}
              </Badge>
            ) : null}

            {slides.length > 1 ? (
              <span className="rounded-md border bg-background/70 px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground backdrop-blur">
                {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
            ) : null}
          </div>

          {/* Word-by-word stagger title */}
          <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-7xl lg:leading-[0.98]">
            <StaggerWords text={slide.title} slideId={slide.id} />
          </h1>

          {slide.description ? (
            <p
              key={`desc-${slide.id}`}
              className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg animate-[hero-fade-up_500ms_cubic-bezier(.22,1,.36,1)_280ms_both]"
            >
              {slide.description}
            </p>
          ) : null}

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center animate-[hero-fade-up_500ms_cubic-bezier(.22,1,.36,1)_400ms_both]">
            {slide.ctaPrimaryText && slide.ctaPrimaryUrl ? (
              <Button asChild size="lg" className="group/btn h-10 rounded-md px-4 transition-shadow duration-300 hover:shadow-[0_0_16px_hsl(var(--primary)/.35)]">
                <Link href={slide.ctaPrimaryUrl}>
                  {slide.ctaPrimaryText}
                  <ArrowRight data-icon="inline-end" className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            ) : null}
            {slide.ctaSecondaryText && slide.ctaSecondaryUrl ? (
              <Button asChild variant="outline" size="lg" className="h-10 rounded-md bg-background/70 px-4 backdrop-blur transition-shadow duration-300 hover:shadow-md">
                <Link href={slide.ctaSecondaryUrl}>
                  {slide.ctaSecondaryText}
                </Link>
              </Button>
            ) : null}
          </div>

          {/* Mobile image */}
          <div className="relative mt-8 overflow-hidden rounded-lg border bg-muted lg:hidden">
            <div className="relative aspect-[16/9]">
              {slide.type === "VIDEO" && slide.videoUrl ? (
                <video
                  key={`mobile-${slide.videoUrl}`}
                  className="h-full w-full object-cover"
                  src={slide.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : displayImageUrl ? (
                <div
                  key={`mobile-${displayImageUrl}`}
                  className="h-full w-full bg-cover bg-center transition-[background-image] duration-700"
                  style={{ backgroundImage: `url(${displayImageUrl})` }}
                />
              ) : (
                <div className="flex h-full items-end bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:28px_28px] p-4">
                  <span className="text-xs font-medium text-muted-foreground">{slide.title}</span>
                </div>
              )}
            </div>
            {slides.length > 1 && (
              <div className="absolute bottom-3 left-3 right-3 flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all",
                      i === current ? "bg-background" : "bg-background/40"
                    )}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Image panel - 3D tilt */}
        <div className="relative hidden lg:block">
          <div className="absolute -left-8 top-10 z-10 rounded-md border bg-background/85 px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur [transform:translate3d(calc(var(--hx,0)*-.6),calc(var(--hy,0)*-.6),0)] [transition:transform_600ms_ease-out] animate-[hero-float_4s_ease-in-out_infinite]">
            01
          </div>
          <div className="absolute -right-5 bottom-16 z-10 rounded-md border bg-background/85 px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur [transform:translate3d(calc(var(--hx,0)*.7),calc(var(--hy,0)*.7),0)] [transition:transform_600ms_ease-out] animate-[hero-float_4.6s_ease-in-out_infinite]">
            03
          </div>

          <div className="group/preview rounded-lg border bg-background/80 p-2 shadow-sm backdrop-blur [will-change:transform] [transform:perspective(800px)_translate3d(calc(var(--hx,0)*.18),calc(var(--hy,0)*.18),0)_rotateX(var(--hrx,0deg))_rotateY(var(--hry,0deg))] [transition:transform_500ms_ease-out,box-shadow_300ms] hover:shadow-lg">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
              {slide.type === "VIDEO" && slide.videoUrl ? (
                <video
                  key={`panel-${slide.videoUrl}`}
                  className="h-full w-full object-cover [will-change:transform] [transform:translate3d(calc(var(--hx,0)*-.4),calc(var(--hy,0)*-.4),0)_scale(1.05)] [transition:transform_600ms_ease-out]"
                  src={slide.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : displayImageUrl ? (
                <div
                  key={`panel-${displayImageUrl}`}
                  className="h-full w-full bg-cover bg-center [will-change:transform] [transform:translate3d(calc(var(--hx,0)*-.4),calc(var(--hy,0)*-.4),0)_scale(1.05)] [transition:transform_600ms_ease-out,background-image_700ms_ease-in-out]"
                  style={{ backgroundImage: `url(${displayImageUrl})` }}
                />
              ) : (
                <div className="flex h-full items-end bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] p-4">
                  <span className="text-xs font-medium text-muted-foreground">{slide.title}</span>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background/80 to-transparent" />
              <div className="absolute inset-4 rounded-md border border-background/35 opacity-80" />

              <div className="absolute left-4 top-4 flex gap-1.5">
                <span className="size-2 rounded-full bg-background/80" />
                <span className="size-2 rounded-full bg-background/60" />
                <span className="size-2 rounded-full bg-background/40" />
              </div>

              <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => slides[index] && goTo(index)}
                    className={cn(
                      "h-1 rounded-full bg-background/35 transition-all duration-300 hover:bg-background/80",
                      index === current && "bg-background"
                    )}
                    aria-label={`Show slide ${index + 1}`}
                    disabled={!slides[index]}
                  />
                ))}
              </div>

              <div className="absolute right-4 top-4 flex items-center gap-1 rounded-md border border-background/35 bg-background/70 px-2 py-1 text-[10px] font-medium text-foreground shadow-xs backdrop-blur [transform:translate3d(calc(var(--hx,0)*-.2),calc(var(--hy,0)*-.2),0)] [transition:transform_500ms_ease-out]">
                <MousePointer2 className="size-3" />
                {String(current + 1).padStart(2, "0")}
              </div>

              {/* Mouse spotlight on image */}
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(200px_circle_at_var(--mx,50%)_var(--my,45%),rgb(255_255_255_/_0.18),transparent_60%)] group-hover/preview:opacity-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      {slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-4 z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="hidden min-w-0 flex-1 items-center gap-2 sm:flex">
            {slides.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  "group h-8 min-w-0 max-w-36 flex-1 rounded-md border bg-background/75 px-2 text-left text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-all duration-300 hover:bg-background hover:text-foreground hover:-translate-y-0.5",
                  i === current && "border-foreground/20 bg-background text-foreground"
                )}
                aria-label={`Show slide ${i + 1}`}
              >
                <span className="block truncate">{item.subtitle || item.title}</span>
                <span
                  key={i === current ? `progress-${current}` : undefined}
                  className={cn(
                    "mt-1 block h-px origin-left bg-muted-foreground/30",
                    i === current && !isPaused
                      ? "animate-[hero-progress_7s_linear_forwards] bg-foreground"
                      : i === current
                        ? "scale-x-100 bg-foreground"
                        : ""
                  )}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-1">
            <Button variant="outline" size="icon" onClick={prev} className="size-9 rounded-md bg-background/75 backdrop-blur sm:size-8" aria-label="Previous slide">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs font-medium tabular-nums text-muted-foreground sm:hidden">
              {current + 1} / {slides.length}
            </span>
            <Button variant="outline" size="icon" onClick={next} className="size-9 rounded-md bg-background/75 backdrop-blur sm:size-8" aria-label="Next slide">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes hero-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes hero-content-in {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-word-in {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-tile-in {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hero-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes hero-line {
          0%, 100% { transform: scaleY(0.35); opacity: 0.35; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        @keyframes hero-line-x {
          0%, 100% { transform: scaleX(0.35); opacity: 0.35; }
          50% { transform: scaleX(1); opacity: 1; }
        }
      ` }} />
    </section>
  );
}
