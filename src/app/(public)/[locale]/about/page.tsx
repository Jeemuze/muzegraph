import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import AboutPageContent from "@/components/public/about/about-page-content";

type Props = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;

  const [settings, seo, dict, page, counts] = await Promise.all([
    prisma.siteSetting.findMany(),
    prisma.seo.findFirst(),
    getDictionary(locale),
    prisma.page.findFirst({
      where: { slug: "about", status: "PUBLISHED" },
      include: {
        sections: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
        translations: {
          include: { language: { select: { code: true } } },
        },
      },
    }),
    Promise.all([
      prisma.service.count({ where: { isActive: true } }),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.testimonial.count({ where: { isActive: true } }),
      prisma.portfolio.count({ where: { isActive: true } }),
    ]),
  ]);

  const settingMap = Object.fromEntries(settings.map((item) => [item.key, item.value]));
  const siteName = seo?.siteName || "Website";
  const translation =
    page?.translations.find((item) => item.language.code === locale) ||
    page?.translations[0] ||
    null;

  const heading =
    translation?.title ||
    `${locale === "en" ? "We are" : "Kami adalah"} ${siteName}`;
  const description = translation?.excerpt || dict["about.description"];

  return (
    <AboutPageContent
      locale={locale}
      siteName={siteName}
      heading={heading}
      description={description}
      content={translation?.content || ""}
      hasDbPage={Boolean(page && translation)}
      contact={{
        email: settingMap.contact_email,
        phone: settingMap.contact_phone,
        address: settingMap.address,
      }}
      stats={[
        {
          label: locale === "en" ? "Active services" : "Layanan aktif",
          value: `${counts[0]}+`,
        },
        {
          label: locale === "en" ? "Published insights" : "Insight terbit",
          value: `${counts[1]}+`,
        },
        {
          label: locale === "en" ? "Client signals" : "Sinyal klien",
          value: `${counts[2]}+`,
        },
        {
          label: locale === "en" ? "Portfolio work" : "Karya portfolio",
          value: `${counts[3]}+`,
        },
      ]}
      values={[
        {
          title: dict["about.mission_title"],
          text: dict["about.mission_text"],
          type: "mission",
        },
        {
          title: dict["about.vision_title"],
          text: dict["about.vision_text"],
          type: "vision",
        },
        {
          title: locale === "en" ? "How we work" : "Cara kami bekerja",
          text:
            locale === "en"
              ? "Focused discovery, lean execution, and practical digital systems that can keep growing after launch."
              : "Discovery yang fokus, eksekusi ringkas, dan sistem digital praktis yang tetap bisa berkembang setelah launch.",
          type: "process",
        },
      ]}
      cta={{
        heading: dict["about.cta_heading"],
        text: dict["about.cta_text"],
        button: dict["about.cta_button"],
      }}
    />
  );
}
