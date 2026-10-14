import { prisma } from "@/lib/prisma";
import HeroSlider, { type HeroSlide } from "./hero-slider";

type Props = {
  locale: string;
};

export default async function HeroSection({ locale }: Props) {
  const heroes = await prisma.hero.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      image: { select: { url: true } },
      images: { orderBy: { order: "asc" }, include: { media: { select: { url: true } } } },
      translations: {
        include: { language: { select: { code: true } } },
      },
    },
  });

  const slides = heroes
    .map((hero) => {
      const t =
        hero.translations.find((tr) => tr.language.code === locale) ||
        hero.translations[0];
      if (!t) return null;

      const imageUrl = hero.type === "SLIDER" && hero.images.length > 0
        ? hero.images[0].media.url
        : hero.image?.url ?? null;

      const imageUrls = hero.type === "SLIDER"
        ? hero.images.map((img) => img.media.url)
        : hero.image?.url ? [hero.image.url] : [];

      return {
        id: hero.id,
        title: t.title,
        subtitle: t.subtitle,
        description: t.description,
        ctaPrimaryText: t.ctaPrimaryText,
        ctaPrimaryUrl: hero.ctaPrimaryUrl,
        ctaSecondaryText: t.ctaSecondaryText,
        ctaSecondaryUrl: hero.ctaSecondaryUrl,
        imageUrl,
        imageUrls,
        videoUrl: hero.videoUrl,
        type: hero.type,
        overlayOpacity: hero.overlayOpacity,
      } as HeroSlide;
    })
    .filter(Boolean) as HeroSlide[];

  if (!slides.length) return null;

  return <HeroSlider slides={slides} />;
}
