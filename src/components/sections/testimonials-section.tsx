import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import { Badge } from "@/components/ui/badge";
import TestimonialSlider from "./testimonial-slider";

type Props = { locale: string };

export default async function TestimonialsSection({ locale }: Props) {
  const [testimonials, dict] = await Promise.all([
    prisma.testimonial.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { order: "asc" },
      include: { avatar: { select: { url: true } }, translations: { include: { language: { select: { code: true } } } } },
    }),
    getDictionary(locale),
  ]);

  if (!testimonials.length) return null;

  const items = testimonials
    .map((item) => {
      const t = item.translations.find((tr) => tr.language.code === locale) || item.translations[0];
      if (!t) return null;
      return {
        id: item.id,
        clientName: item.clientName,
        clientRole: item.clientRole,
        companyName: item.companyName,
        companyUrl: item.companyUrl,
        projectName: item.projectName,
        rating: item.rating,
        avatarUrl: item.avatar?.url ?? null,
        content: t.content,
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  if (!items.length) return null;

  return (
    <div>
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Badge variant="outline" className="mb-4 rounded-md bg-background px-2.5 py-1 text-xs font-medium">{dict["testimonials.badge"]}</Badge>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">{dict["testimonials.heading"]}</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{dict["testimonials.subtitle"]}</p>
      </div>
      <div className="mt-12 w-full"><TestimonialSlider items={items} /></div>
    </div>
  );
}
