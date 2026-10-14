import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionary";
import Container from "@/components/ui/container";
import ContactPageContent from "@/components/public/contact/contact-page-content";

type Props = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const [settings, dict] = await Promise.all([
    prisma.siteSetting.findMany(),
    getDictionary(locale),
  ]);

  const s = Object.fromEntries(settings.map((i) => [i.key, i.value]));

  return (
    <ContactPageContent
      locale={locale}
      settings={s}
      copy={{
        badge: dict["contact.badge"],
        heading: dict["contact.heading"],
        subtitle: dict["contact.subtitle"],
      }}
    />
  );
}
