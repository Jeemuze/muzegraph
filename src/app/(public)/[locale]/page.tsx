import Container from "@/components/ui/container";
import HeroSection from "@/components/sections/hero-section";
import ServicesSection from "@/components/sections/services-section";
import TestimonialsSection from "@/components/sections/testimonials-section";
import BlogSection from "@/components/sections/blog-section";
import FaqSectionWrapper from "@/components/sections/faq-section-wrapper";
import CtaSection from "@/components/sections/cta-section";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;

  return (
    <main>
      <HeroSection locale={locale} />

      <section className="py-20 lg:py-28">
        <Container>
          <ServicesSection locale={locale} />
        </Container>
      </section>

      <section className="py-20 lg:py-28 border-t border-border">
        <Container>
          <TestimonialsSection locale={locale} />
        </Container>
      </section>

      <section className="py-20 lg:py-28 border-t border-border">
        <Container>
          <BlogSection locale={locale} />
        </Container>
      </section>

      <section className="py-20 lg:py-28 border-t border-border">
        <Container>
          <FaqSectionWrapper locale={locale} />
        </Container>
      </section>

      <section className="py-20 lg:py-28 border-t border-border">
        <Container>
          <CtaSection locale={locale} />
        </Container>
      </section>
    </main>
  );
}
