"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  CheckCircle2,
  HelpCircle,
  MessageCircle,
  Plus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  categoryName?: string | null;
  categorySlug?: string | null;
};

function extractText(node: any): string {
  if (node.type === "text") return node.text || "";
  if (node.content) return node.content.map(extractText).join(node.type === "doc" ? "\n" : "");
  return "";
}

function answerToText(value: string): string {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") return extractText(parsed);
  } catch {}
  return value;
}
type Props = { locale: string; items: FaqItem[]; dict: Record<string, string> };

export default function FaqSection({ locale, items, dict }: Props) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(() => {
    const map = new Map<string, string>();

    items.forEach((item) => {
      if (item.categoryName) {
        map.set(item.categorySlug || item.categoryName, item.categoryName);
      }
    });

    return Array.from(map, ([slug, name]) => ({ slug, name }));
  }, [items]);

  const visibleItems = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter(
      (item) => (item.categorySlug || item.categoryName) === activeCategory
    );
  }, [activeCategory, items]);

  if (!items.length) return null;

  const changeCategory = (slug: string) => {
    setActiveCategory(slug);
    const nextItem =
      slug === "all"
        ? items[0]
        : items.find((item) => (item.categorySlug || item.categoryName) === slug);
    setOpenId(nextItem?.id ?? null);
  };

  return (
    <div className="relative overflow-hidden rounded-lg border bg-background p-5 shadow-sm sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:36px_36px] opacity-20 [mask-image:linear-gradient(to_bottom,#000,transparent_88%)]" />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)] lg:gap-10">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <Badge
              variant="outline"
              className="mb-4 rounded-md bg-background px-2.5 py-1 text-xs font-medium"
            >
              <Sparkles className="mr-1 size-3" />
              {dict["faq.badge"]}
            </Badge>
            <h2 className="max-w-lg text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {dict["faq.heading"]}
            </h2>
            <p className="mt-4 max-w-[36rem] text-base leading-7 text-muted-foreground sm:text-lg">
              {dict["faq.subtitle"]}
            </p>
          </div>

          {categories.length ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => changeCategory("all")}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                  activeCategory === "all"
                    ? "border-foreground bg-foreground text-background shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/30"
                )}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => changeCategory(category.slug)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                    activeCategory === category.slug
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          ) : null}

          <Link
            href={`/${locale}/contact`}
            className="group/link flex w-fit items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <MessageCircle className="size-4" />
            {locale === "en" ? "Contact us" : "Hubungi kami"}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </Link>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-lg border bg-background shadow-sm">
            {visibleItems.map((item, i) => {
              const isOpen = openId === item.id;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "relative border-b border-border last:border-b-0 animate-[faq-reveal_420ms_ease-out_both]",
                    isOpen && "bg-muted/30"
                  )}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="group/item flex w-full items-start justify-between gap-4 px-4 py-5 text-left transition-colors hover:bg-muted/35 focus-visible:bg-muted/45 focus-visible:outline-none sm:px-5"
                    aria-expanded={isOpen}
                  >
                    <span className="flex min-w-0 items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border transition-all duration-300",
                          isOpen
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-muted-foreground group-hover/item:border-foreground/20"
                        )}
                      >
                        {isOpen ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <HelpCircle className="size-4" />
                        )}
                      </span>
                      <span>
                        {item.categoryName ? (
                          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            {item.categoryName}
                          </span>
                        ) : null}
                        <span className="block text-sm font-semibold leading-6 text-foreground sm:text-base">
                          {item.question}
                        </span>
                      </span>
                    </span>
                    <Plus
                      className={cn(
                        "mt-1 size-5 shrink-0 text-muted-foreground transition-all duration-300",
                        isOpen && "rotate-45 text-foreground"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 pb-5 pl-[4.75rem] pr-8 text-sm leading-relaxed text-muted-foreground sm:px-5 sm:pl-[5.25rem]">
                        {answerToText(item.answer)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 h-px origin-left bg-foreground transition-transform duration-500",
                      isOpen ? "w-full scale-x-100" : "w-full scale-x-0"
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes faq-reveal {
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
