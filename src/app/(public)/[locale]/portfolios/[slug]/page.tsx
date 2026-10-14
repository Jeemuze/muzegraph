import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Briefcase, Calendar, MapPin, Sparkles } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import PortfolioDetailContent from "@/components/portfolios/portfolio-detail-content";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function PortfolioDetailPage({ params }: Props) {
  const { locale, slug } = await params;

  const [portfolio, dict] = await Promise.all([
    prisma.portfolio.findFirst({
      where: { slug, isActive: true },
      include: {
        coverImage: { select: { url: true } },
        translations: { include: { language: true } },
        galleries: {
          include: { media: { select: { id: true, url: true, name: true } } },
          orderBy: { order: "asc" },
        },
        tags: {
          include: {
            tag: { include: { translations: { include: { language: true } } } },
          },
        },
      },
    }),
    getDictionary(locale),
  ]);

  if (!portfolio) return notFound();

  const t =
    portfolio.translations.find((tr) => tr.language.code === locale) ||
    portfolio.translations[0];
  if (!t) return notFound();

  const tags = portfolio.tags
    .map((tm) => {
      const tt =
        tm.tag.translations.find((tr) => tr.language.code === locale) ||
        tm.tag.translations[0];
      return tt ? tt.name : null;
    })
    .filter((n): n is string => n !== null);

  return (
    <main>
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b bg-background py-16 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25 [mask-image:linear-gradient(to_bottom,#000,transparent_86%)]" />
        <Container>
          <Button asChild variant="ghost" className="mb-8 -ml-3 h-9 px-3 text-sm">
            <Link href={`/${locale}/portfolios`}>
              <ArrowLeft className="size-4" />
              {dict["portfolios.badge"]}
            </Link>
          </Button>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                <Sparkles className="size-3.5" />
                {dict["portfolios.badge"]}
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {t.title}
              </h1>
              {t.excerpt && (
                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {t.excerpt}
                </p>
              )}
              {tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Meta card */}
            <div className="space-y-4 rounded-lg border bg-background p-5 text-sm">
              {portfolio.clientName && (
                <div className="flex items-center gap-3">
                  <Briefcase className="size-4 text-muted-foreground" />
                  <span className="text-foreground">{portfolio.clientName}</span>
                </div>
              )}
              {portfolio.industry && (
                <div className="flex items-center gap-3">
                  <Sparkles className="size-4 text-muted-foreground" />
                  <span className="text-foreground">{portfolio.industry}</span>
                </div>
              )}
              {portfolio.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="text-foreground">{portfolio.location}</span>
                </div>
              )}
              {portfolio.completedAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {new Date(portfolio.completedAt).toLocaleDateString(
                      locale === "en" ? "en-US" : "id-ID",
                      { year: "numeric", month: "long" }
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Cover image */}
      {portfolio.coverImage?.url && (
        <section className="py-10 lg:py-14">
          <Container>
            <div className="relative aspect-[21/9] overflow-hidden rounded-lg border bg-muted">
              <Image
                src={portfolio.coverImage.url}
                alt={t.title}
                fill
                unoptimized
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </Container>
        </section>
      )}

      {/* Content */}
      <section className="py-10 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <PortfolioDetailContent description={t.description} result={t.result} locale={locale} />
          </div>
        </Container>
      </section>

      {/* Gallery */}
      {portfolio.galleries.length > 0 && (
        <section className="border-t py-14 lg:py-20">
          <Container>
            <h2 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
              {locale === "en" ? "Gallery" : "Galeri"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {portfolio.galleries.map((g) => (
                <div
                  key={g.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted"
                >
                  <Image
                    src={g.media.url}
                    alt={g.media.name || t.title}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA */}
      <section className="border-t py-16 lg:py-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {dict["portfolios.cta_heading"]}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                {dict["portfolios.cta_subtitle"]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild className="h-11 rounded-md px-5">
                <Link href={`/${locale}/contact`}>
                  {dict["portfolios.cta_button"]}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-md px-5">
                <Link href={`/${locale}/portfolios`}>
                  <ArrowLeft className="size-4" />
                  {dict["portfolios.badge"]}
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
