import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import ServicesShowcase, { type ServiceShowcaseItem } from "./services-showcase";

function extractText(node: any): string {
  if (!node || typeof node !== "object") return "";
  if (node.type === "text") return node.text || "";
  if (Array.isArray(node.content)) return node.content.map(extractText).join("");
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
  const blocks = Array.isArray(obj.content) ? obj.content : Array.isArray(doc) ? (doc as any[]) : [doc];

  const text = blocks.map(extractText).join(" ").trim();
  return text || String(value);
}

type Props = { locale: string };

export default async function ServicesSection({ locale }: Props) {
  const [services, dict] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: { translations: { include: { language: true } } },
    }),
    getDictionary(locale),
  ]);

  if (!services.length) return null;

  const items: ServiceShowcaseItem[] = services
    .map((service) => {
      const t =
        service.translations.find((tr) => tr.language.code === locale) ||
        service.translations[0];

      if (!t) return null;

      return {
        id: service.id,
        title: t.title,
        slug: t.slug,
        description: parseDescription(t.description),
        icon: service.icon,
      };
    })
    .filter((item): item is ServiceShowcaseItem => item !== null);

  return (
    <ServicesShowcase
      locale={locale}
      badge={dict["services.badge"]}
      heading={dict["services.heading"]}
      subtitle={dict["services.subtitle"]}
      cta={dict["services.cta"]}
      items={items}
    />
  );
}
