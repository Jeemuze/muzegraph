import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Container from "@/components/ui/container";
import PageContent from "@/components/public/page/page-content";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function DynamicPage({ params }: Props) {
  const { locale, slug } = await params;

  // Skip known routes
  const reserved = ["about", "services", "blog", "contact", "forbidden"];
  if (reserved.includes(slug)) return notFound();

  const page = await prisma.page.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { translations: { include: { language: { select: { code: true } } } } },
  });

  if (!page) return notFound();

  const t = page.translations.find((tr) => tr.language.code === locale) || page.translations[0];
  if (!t) return notFound();

  return (
    <main>
      <section className="relative flex items-center overflow-hidden border-b border-border bg-background py-20 lg:py-24">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-40" />
        <Container>
          <div className="relative flex flex-col items-center text-center">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t.title}
            </h1>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <PageContent content={t.content || ""} />
          </div>
        </Container>
      </section>
    </main>
  );
}
