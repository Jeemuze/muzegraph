import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import FaqSection from "./faq-section";

type Props = { locale: string };

export default async function FaqSectionWrapper({ locale }: Props) {
  const [faqs, dict] = await Promise.all([
    prisma.faq.findMany({
      where: { isActive: true, isFeatured: true },
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
    getDictionary(locale),
  ]);

  const items = faqs
    .map((faq) => {
      const t = faq.translations.find((tr) => tr.language.code === locale) || faq.translations[0];
      if (!t) return null;
      const categoryName =
        faq.category?.translations.find((tr) => tr.language.code === locale)
          ?.name ||
        faq.category?.translations[0]?.name ||
        null;

      return {
        id: faq.id,
        question: t.question,
        answer: t.answer,
        categoryName,
        categorySlug: faq.category?.slug ?? null,
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  if (!items.length) return null;

  return <FaqSection locale={locale} items={items} dict={dict} />;
}
