import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Camera,
  Clock3,
  Code2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { getNavItems } from "./nav-config";
import { ThemeLogo } from "./theme-logo";

type Props = { locale: string };

export default async function Footer({ locale }: Props) {
  const [seo, settingsRaw, services] = await Promise.all([
    prisma.seo.findFirst(),
    prisma.siteSetting.findMany(),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 5,
      include: {
        translations: {
          include: { language: { select: { code: true } } },
        },
      },
    }),
  ]);

  const siteName = seo?.siteName || "Website";
  const settings = Object.fromEntries(settingsRaw.map((s) => [s.key, s.value]));
  const navigation = getNavItems(locale);
  const socialLinks = [
    settings.social_instagram
      ? { label: "Instagram", href: settings.social_instagram, icon: Camera }
      : null,
    settings.social_linkedin
      ? { label: "LinkedIn", href: settings.social_linkedin, icon: BriefcaseBusiness }
      : null,
    settings.social_github
      ? { label: "GitHub", href: settings.social_github, icon: Code2 }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);
  const serviceLinks = services
    .map((service) => {
      const translation =
        service.translations.find((item) => item.language.code === locale) ||
        service.translations[0];

      if (!translation) return null;

      return {
        label: translation.title,
        href: `/${locale}/services/${translation.slug}`,
      };
    })
    .filter((item): item is { label: string; href: string } => item !== null);

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,2fr)] lg:gap-16">
          <div>
            <Link href={`/${locale}`} className="inline-flex items-center gap-3">
              <ThemeLogo
                logoDark={seo?.siteLogoDark || seo?.siteLogo || "/assets/logo-dark.png"}
                logoLight={seo?.siteLogoLight || seo?.siteLogo || "/assets/logo-light.png"}
                siteName={siteName}
                className="h-9 w-auto shrink-0 object-contain"
                fallbackClassName="flex size-9 shrink-0 items-center justify-center rounded-md bg-foreground text-sm font-semibold text-background"
              />
              <span className="text-lg font-semibold tracking-tight text-foreground">{siteName}</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
              {seo?.description ||
                (locale === "en"
                  ? "Professional websites and digital solutions for modern businesses."
                  : "Website profesional dan solusi digital untuk bisnis modern.")}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="flex size-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[0.4fr_1fr_1.85fr] lg:gap-12">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                {locale === "en" ? "Pages" : "Halaman"}
              </h4>
              <nav className="mt-4 space-y-3">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground">
                {locale === "en" ? "Services" : "Layanan"}
              </h4>
              <nav className="mt-4 space-y-3">
                {serviceLinks.length ? (
                  serviceLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))
                ) : (
                  <Link
                    href={`/${locale}/services`}
                    className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {locale === "en" ? "View services" : "Lihat layanan"}
                  </Link>
                )}
              </nav>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground">
                {locale === "en" ? "Contact" : "Kontak"}
              </h4>

              <div className="mt-4 space-y-3">
                {settings.contact_email ? (
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="flex items-start gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Mail className="mt-0.5 size-4 shrink-0" />
                    <span className="min-w-0 break-words">{settings.contact_email}</span>
                  </a>
                ) : null}

                {settings.contact_phone ? (
                  <a
                    href={`tel:${settings.contact_phone}`}
                    className="flex items-start gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Phone className="mt-0.5 size-4 shrink-0" />
                    <span>{settings.contact_phone}</span>
                  </a>
                ) : null}

                {settings.address ? (
                  <div className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0" />
                    <span>{settings.address}</span>
                  </div>
                ) : null}

                {settings.working_hours ? (
                  <div className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                    <Clock3 className="mt-0.5 size-4 shrink-0" />
                    <span>{settings.working_hours}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteName}. {locale === "en" ? "All rights reserved." : "Hak cipta dilindungi."}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href={`/${locale}/privacy-policy`} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              {locale === "en" ? "Privacy Policy" : "Kebijakan Privasi"}
            </Link>
            <Link href={`/${locale}/terms-of-service`} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              {locale === "en" ? "Terms of Service" : "Syarat & Ketentuan"}
            </Link>
            <Link href={`/${locale}/disclaimer`} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
