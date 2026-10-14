import { getDictionary } from "@/lib/dictionary";
import CtaExperience from "./cta-experience";

type Props = { locale: string };

export default async function CtaSection({ locale }: Props) {
  const dict = await getDictionary(locale);

  return (
    <CtaExperience
      locale={locale}
      heading={dict["cta.heading"]}
      subtitle={dict["cta.subtitle"]}
      primaryLabel={dict["cta.primary"]}
      secondaryLabel={dict["cta.secondary"]}
    />
  );
}
