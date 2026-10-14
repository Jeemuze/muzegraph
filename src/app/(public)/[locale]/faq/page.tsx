import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import { Badge } from "@/components/ui/badge";
import Container from "@/components/ui/container";
import FaqPageContent, {
  type FaqPageCategory,
  type FaqPageItem,
} from "@/components/public/faq/faq-page-content";
import { Sparkles } from "lucide-react";

type Props = { params: Promise<{ locale: string }> };

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  const [faqs, categories, dict] = await Promise.all([
    prisma.faq.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        translations: { include: { language: { select: { code: true } } } },
        category: {
          include: {
            translations: {
              include: { language: { select: { code: true } } },
            },
          },
        },
      },
    }),
    prisma.faqCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        translations: { include: { language: { select: { code: true } } } },
        _count: { select: { faqs: true } },
      },
    }),
    getDictionary(locale),
  ]);

  const items: FaqPageItem[] = faqs
    .map((faq) => {
      const translation =
        faq.translations.find((item) => item.language.code === locale) ||
        faq.translations[0];
      if (!translation) return null;

      const categoryTranslation =
        faq.category?.translations.find((item) => item.language.code === locale) ||
        faq.category?.translations[0] ||
        null;

      return {
        id: faq.id,
        question: translation.question,
        answer: translation.answer,
        categoryName: categoryTranslation?.name ?? null,
        categorySlug: faq.category?.slug ?? null,
        isFeatured: faq.isFeatured,
      };
    })
    .filter((item): item is FaqPageItem => item !== null);

  const categoryItems: FaqPageCategory[] = categories
    .map((category) => {
      const translation =
        category.translations.find((item) => item.language.code === locale) ||
        category.translations[0];
      if (!translation) return null;

      return {
        id: category.id,
        name: translation.name,
        slug: category.slug,
        count: category._count.faqs,
      };
    })
    .filter((item): item is FaqPageCategory => item !== null);

  return (
    <main>
      <section className="relative overflow-hidden border-b bg-background py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20 [mask-image:linear-gradient(to_bottom,#000,transparent_86%)]" />
        <Container>
          <div className="relative max-w-3xl">
            <Badge variant="outline" className="mb-5 rounded-md bg-background px-2.5 py-1 text-xs font-medium">
              <Sparkles className="mr-1 size-3" />
              {dict["faq.badge"]}
            </Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.02]">
              {dict["faq.heading"]}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {dict["faq.subtitle"]}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container>
          <FaqPageContent
            locale={locale}
            items={items}
            categories={categoryItems}
          />
        </Container>
      </section>
    </main>
  );
}
