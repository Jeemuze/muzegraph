import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import PortfoliosPageContent, {
  type PortfolioPageItem,
} from "@/components/portfolios/portfolios-page-content";

type Props = { params: Promise<{ locale: string }> };

function parseDescription(value: string) {
  try {
    const blocks: unknown = JSON.parse(value);
    if (!Array.isArray(blocks)) return value;
    return blocks
      .map((block) => {
        if (!block || typeof block !== "object" || !("content" in block)) return "";
        const content = (block as { content?: unknown }).content;
        if (!Array.isArray(content)) return "";
        return content
          .map((item) => {
            if (!item || typeof item !== "object" || !("text" in item)) return "";
            const text = (item as { text?: unknown }).text;
            return typeof text === "string" ? text : "";
          })
          .join("");
      })
      .join(" ")
      .trim();
  } catch {
    return value;
  }
}

export default async function PortfoliosPage({ params }: Props) {
  const { locale } = await params;
  const [portfolios, dict] = await Promise.all([
    prisma.portfolio.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        coverImage: { select: { url: true } },
        translations: { include: { language: true } },
        tags: {
          include: {
            tag: { include: { translations: { include: { language: true } } } },
          },
        },
      },
    }),
    getDictionary(locale),
  ]);

  const items: PortfolioPageItem[] = portfolios
    .map((p) => {
      const t =
        p.translations.find((tr) => tr.language.code === locale) ||
        p.translations[0];
      if (!t) return null;

      const tags = p.tags
        .map((tm) => {
          const tt =
            tm.tag.translations.find((tr) => tr.language.code === locale) ||
            tm.tag.translations[0];
          return tt ? { slug: tm.tag.slug, name: tt.name } : null;
        })
        .filter((tag): tag is { slug: string; name: string } => tag !== null);

      return {
        id: p.id,
        slug: p.slug,
        title: t.title,
        excerpt: t.excerpt || parseDescription(t.description).slice(0, 120),
        imageUrl: p.coverImage?.url || null,
        clientName: p.clientName,
        industry: p.industry,
        isFeatured: p.isFeatured,
        tags,
      };
    })
    .filter((item): item is PortfolioPageItem => item !== null);

  return (
    <PortfoliosPageContent
      locale={locale}
      items={items}
      copy={{
        eyebrow: dict["portfolios.badge"],
        heading: dict["portfolios.heading"],
        subtitle: dict["portfolios.subtitle"],
        cta: dict["portfolios.cta"],
        ctaHeading: dict["portfolios.cta_heading"],
        ctaSubtitle: dict["portfolios.cta_subtitle"],
        ctaButton: dict["portfolios.cta_button"],
        filterAll: dict["portfolios.filter_all"],
      }}
    />
  );
}
