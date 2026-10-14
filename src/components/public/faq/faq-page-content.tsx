"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

export type FaqPageItem = {
  id: string;
  question: string;
  answer: string;
  categoryName: string | null;
  categorySlug: string | null;
  isFeatured: boolean;
};

export type FaqPageCategory = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

type Props = {
  locale: string;
  items: FaqPageItem[];
  categories: FaqPageCategory[];
};

function answerToText(value: string) {
  try {
    const parsed = JSON.parse(value) as any;
    if (!parsed || typeof parsed !== "object") return value;

    function extractText(node: any): string {
      if (node.type === "text") return node.text || "";
      if (node.content) return node.content.map(extractText).join("");
      return "";
    }

    return extractText(parsed);
  } catch {
    return value;
  }
}

export default function FaqPageContent({ locale, items, categories }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const answer = answerToText(item.answer);
      const matchesQuery =
        !normalizedQuery ||
        item.question.toLowerCase().includes(normalizedQuery) ||
        answer.toLowerCase().includes(normalizedQuery);
      const matchesCategory = !activeCategory || item.categorySlug === activeCategory;

      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, items, query]);

  const featuredCount = items.filter((item) => item.isFeatured).length;
  const activeCategoryName =
    categories.find((category) => category.slug === activeCategory)?.name || null;

  const selectCategory = (slug: string | null) => {
    setActiveCategory(slug);
    const nextItem = slug
      ? items.find((item) => item.categorySlug === slug)
      : items[0];
    setOpenId(nextItem?.id ?? null);
  };

  const clearFilters = () => {
    setQuery("");
    setActiveCategory(null);
    setOpenId(items[0]?.id ?? null);
  };

  return (
    <div className="relative">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <div>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={locale === "en" ? "Search questions..." : "Cari pertanyaan..."}
                className="h-11 w-full rounded-md border bg-background pl-10 pr-4 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => selectCategory(null)}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20",
                  !activeCategory
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground hover:bg-muted/30"
                )}
              >
                {locale === "en" ? "All" : "Semua"} · {items.length}
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectCategory(category.slug)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20",
                    activeCategory === category.slug
                      ? "bg-foreground text-background"
                      : "bg-background text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  {category.name} · {category.count}
                </button>
              ))}
            </div>
          </div>

          {query || activeCategory ? (
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{locale === "en" ? "Filtered by" : "Filter"}</span>
              {query ? <Badge variant="secondary" className="rounded-md">&ldquo;{query}&rdquo;</Badge> : null}
              {activeCategoryName ? <Badge variant="secondary" className="rounded-md">{activeCategoryName}</Badge> : null}
              <button type="button" onClick={clearFilters} className="font-medium underline underline-offset-4 hover:text-foreground">
                {locale === "en" ? "Clear" : "Hapus"}
              </button>
            </div>
          ) : null}

          <div className="mt-8 overflow-hidden rounded-lg border bg-background shadow-sm">
            {filteredItems.length ? (
              filteredItems.map((item, index) => {
                const isOpen = openId === item.id;
                const answer = answerToText(item.answer);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "relative border-b last:border-b-0",
                      isOpen && "bg-muted/30"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="group flex w-full items-start justify-between gap-4 px-4 py-5 text-left transition-colors hover:bg-muted/30 focus-visible:bg-muted/40 focus-visible:outline-none sm:px-5"
                      aria-expanded={isOpen}
                    >
                      <span className="flex min-w-0 items-start gap-3">
                        <span
                          className={cn(
                            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border transition-all duration-200",
                            isOpen
                              ? "bg-foreground text-background"
                              : "bg-background text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          {isOpen ? <CheckCircle2 className="size-4" /> : <HelpCircle className="size-4" />}
                        </span>
                        <span>
                          <span className="mb-1 block text-[11px] font-medium tabular-nums text-muted-foreground">
                            {String(index + 1).padStart(2, "0")}
                            {item.categoryName ? ` · ${item.categoryName}` : ""}
                          </span>
                          <span className="block text-sm font-semibold leading-6 text-foreground sm:text-base">
                            {item.question}
                          </span>
                        </span>
                      </span>
                      <Plus
                        className={cn(
                          "mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-300",
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
                        <p className="px-4 pb-5 pl-[4.75rem] pr-8 whitespace-pre-line text-sm leading-7 text-muted-foreground sm:px-5 sm:pl-[5.25rem]">
                          {answer}
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
              })
            ) : (
              <div className="p-10 text-center">
                <p className="text-sm text-muted-foreground">
                  {locale === "en" ? "No matching questions found." : "Pertanyaan tidak ditemukan."}
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-lg border bg-background p-5 shadow-sm">
            <div className="flex items-center justify-between border-b pb-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="size-4 text-muted-foreground" />
                {locale === "en" ? "FAQ overview" : "Ringkasan FAQ"}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Questions" : "Pertanyaan"}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  {items.length}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {locale === "en" ? "Featured" : "Unggulan"}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  {featuredCount}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t pt-5">
              <p className="text-sm font-semibold text-foreground">
                {locale === "en" ? "Still need help?" : "Masih butuh bantuan?"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {locale === "en"
                  ? "Send your question and we will help map the next step."
                  : "Kirim pertanyaan Anda dan kami bantu arahkan langkah berikutnya."}
              </p>
              <Button asChild variant="outline" className="mt-4 w-full rounded-md bg-background">
                <Link href={`/${locale}/contact`}>
                  <MessageCircle className="size-4" />
                  {locale === "en" ? "Contact us" : "Hubungi kami"}
                  <ArrowRight data-icon="inline-end" className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
