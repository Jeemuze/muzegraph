import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { getDictionary } from "@/lib/dictionary";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import ServiceContent from "@/components/services/service-content";
import ServiceDetailHeroNew from "@/components/services/service-detail-hero-new";

import { resolveContent } from "@/lib/content-resolver";
import { buildAlternatePaths } from "@/lib/route-alternates";
import SetRouteAlternate from "@/components/providers/set-route-alternate";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params;

  const [service, dict] = await Promise.all([
    resolveContent({ type: "service", slug, locale }),
    getDictionary(locale),
  ]);

  if (!service) return notFound();
  const translation = service.translations.find((t: any) => t.language.code === locale) || service.translations[0];
  if (!translation) return notFound();

  const alternatePaths = buildAlternatePaths(service, "services");
  const images = service.images?.map((img: any) => img.media?.url).filter(Boolean) || [];

  return (
    <>
      <SetRouteAlternate alternatePaths={alternatePaths} />
      <main>
        <ServiceDetailHeroNew
          title={translation.title}
          subtitle={dict["services.detail_subtitle"]}
          badge={dict["services.badge"]}
          icon={service.icon}
          locale={locale}
          ctaLabel={dict["services.detail_button"]}
          imageUrl={images[0] || null}
        />

        <section className="py-14 lg:py-20">
          <Container>
            <div className="mx-auto max-w-3xl">
              <ServiceContent description={translation.description} />
            </div>
          </Container>
        </section>

        {/* Gallery */}
        {images.length > 1 && (
          <section className="border-t py-14 lg:py-20">
            <Container>
              <h2 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
                {locale === "en" ? "Gallery" : "Galeri"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.slice(1).map((url: string, i: number) => (
                  <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
                    <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />
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
                  {dict["services.detail_cta"]}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                  {dict["services.detail_cta_sub"]}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button asChild className="h-11 rounded-md px-5">
                  <Link href={`/${locale}/contact`}>
                    {dict["services.detail_button"]}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-md px-5">
                  <Link href={`/${locale}/services`}>
                    <ArrowLeft className="size-4" />
                    {dict["services.back"]}
                  </Link>
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
