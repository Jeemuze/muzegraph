import { prisma } from "@/lib/prisma";

export async function getOrganizationSchema() {
  const [seo, settings] = await Promise.all([
    prisma.seo.findFirst(),
    prisma.siteSetting.findMany({
      where: { key: { in: ["contact_phone"] } },
    }),
  ]);

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: seo?.siteName || "",
    url: seo?.siteUrl || "",
    logo: seo?.siteLogo || "",
    ...(settingsMap.contact_phone && {
      contactPoint: {
        "@type": "ContactPoint",
        telephone: settingsMap.contact_phone,
        contactType: "customer service",
      },
    }),
  };
}

export async function getWebsiteSchema() {
  const seo = await prisma.seo.findFirst();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: seo?.siteName || "",
    url: seo?.siteUrl || "",
  };
}

function extractText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  if (n.type === "text" && typeof n.text === "string") return n.text;
  if (Array.isArray(n.content)) return n.content.map(extractText).join("");
  return "";
}

function parseDescription(value: string): string {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return value;
    return extractText(parsed).trim() || value;
  } catch {
    return value;
  }
}

export async function getServiceSchemas() {
  const [seo, services] = await Promise.all([
    prisma.seo.findFirst(),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: { translations: { take: 1 } },
    }),
  ]);

  return services
    .map((service) => {
      const t = service.translations[0];
      if (!t) return null;
      return {
        "@context": "https://schema.org",
        "@type": "Service",
        name: t.title,
        description: parseDescription(t.description),
        provider: {
          "@type": "Organization",
          name: seo?.siteName || "",
        },
        areaServed: "Indonesia",
      };
    })
    .filter(Boolean);
}
