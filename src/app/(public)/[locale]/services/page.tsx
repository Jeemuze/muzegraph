import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import ServicesPageContent, {
  type ServicesPageItem,
} from "@/components/services/services-page-content";

type Props = { params: Promise<{ locale: string }> };

function extractText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  if (n.type === "text" && typeof n.text === "string") return n.text;
  if (Array.isArray(n.content)) return n.content.map(extractText).join("");
  return "";
}

function parseDescription(value: unknown): string {
  if (!value) return "";

  let doc: unknown = value;

  if (typeof value === "string") {
    try {
      doc = JSON.parse(value);
    } catch {
      return value;
    }
  }

  if (!doc || typeof doc !== "object") return String(value);

  const obj = doc as Record<string, unknown>;
  const blocks = Array.isArray(obj.content) ? obj.content : Array.isArray(doc) ? doc : [doc];

  const text = (blocks as unknown[]).map(extractText).join(" ").trim();
  return text || String(value);
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  const [services, dict] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        images: {
          orderBy: { order: "asc" },
          take: 1,
          include: { media: { select: { url: true } } },
        },
        translations: { include: { language: true } },
      },
    }),
    getDictionary(locale),
  ]);

  const items: ServicesPageItem[] = services
    .map((service) => {
      const translation =
        service.translations.find((item) => item.language.code === locale) ||
        service.translations[0];

      if (!translation) return null;

      return {
        id: service.id,
        title: translation.title,
        slug: translation.slug,
        description: parseDescription(translation.description).slice(0, 200),
        icon: service.icon,
        imageUrl: service.images[0]?.media.url || null,
      };
    })
    .filter((item): item is ServicesPageItem => item !== null);

  return (
    <ServicesPageContent
      locale={locale}
      items={items}
      copy={{
        eyebrow: dict["services.badge"],
        heading: dict["services.heading"],
        subtitle: dict["services.subtitle"],
        cta: dict["services.cta"],
        ctaHeading: dict["services.cta_heading"],
        ctaSubtitle: dict["services.cta_subtitle"],
        ctaButton: dict["services.cta_button"],
      }}
    />
  );
}
