"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  Mail,
  MapPin,
  MousePointer2,
  Palette,
  Phone,
  Rocket,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import PageContent from "@/components/public/page/page-content";

type AboutValue = {
  title: string;
  text: string;
  type: "mission" | "vision" | "process";
};

type Props = {
  locale: string;
  siteName: string;
  heading: string;
  description: string;
  content: string;
  hasDbPage: boolean;
  stats: { label: string; value: string }[];
  values: AboutValue[];
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
  cta: {
    heading: string;
    text: string;
    button: string;
  };
};

const iconMap = {
  mission: Rocket,
  vision: Palette,
  process: Code2,
};

export default function AboutPageContent({
  locale,
  siteName,
  heading,
  description,
  content,
  hasDbPage,
  stats,
  values,
  contact,
  cta,
}: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const [activeValue, setActiveValue] = useState(0);
  const active = values[activeValue] || values[0];
  const ActiveIcon = iconMap[active.type];

  const contactItems = useMemo(
    () =>
      [
        contact.email
          ? {
              icon: Mail,
              label: "Email",
              value: contact.email,
              href: `mailto:${contact.email}`,
            }
          : null,
        contact.phone
          ? {
              icon: Phone,
              label: locale === "en" ? "Phone" : "Telepon",
              value: contact.phone,
              href: `tel:${contact.phone}`,
            }
          : null,
        contact.address
          ? {
              icon: MapPin,
              label: locale === "en" ? "Address" : "Alamat",
              value: contact.address,
              href: null,
            }
          : null,
      ].filter(Boolean) as {
        icon: typeof Mail;
        label: string;
        value: string;
        href: string | null;
      }[],
    [contact.address, contact.email, contact.phone, locale]
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const el = heroRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const tiltX = ((y / rect.height) - 0.5) * -7;
    const tiltY = ((x / rect.width) - 0.5) * 7;

    el.style.setProperty("--about-x", `${x}px`);
    el.style.setProperty("--about-y", `${y}px`);
    el.style.setProperty("--about-tilt-x", `${tiltX.toFixed(2)}deg`);
    el.style.setProperty("--about-tilt-y", `${tiltY.toFixed(2)}deg`);
  };

  return (
    <main>
      <section
        ref={heroRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => {
          const el = heroRef.current;
          if (!el) return;
          el.style.setProperty("--about-tilt-x", "0deg");
          el.style.setProperty("--about-tilt-y", "0deg");
        }}
        className="group relative isolate overflow-hidden border-b bg-background py-16 sm:py-20 lg:py-24"
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30 [mask-image:linear-gradient(to_bottom,#000,transparent_88%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 [background:radial-gradient(360px_circle_at_var(--about-x,50%)_var(--about-y,35%),var(--muted),transparent_72%)] md:group-hover:opacity-100" />

        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.52fr)] lg:items-end">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 border-b pb-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                <BriefcaseBusiness className="size-3.5" />
                {hasDbPage
                  ? locale === "en"
                    ? "Loaded from admin page"
                    : "Diambil dari halaman admin"
                  : locale === "en"
                    ? "About"
                    : "Tentang"}
              </div>
              <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-7xl lg:leading-[0.98]">
                {heading}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                {description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-11 rounded-md px-5">
                  <Link href={`/${locale}/contact`}>
                    {cta.button}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-md px-5">
                  <Link href={`/${locale}/services`}>
                    {locale === "en" ? "Explore services" : "Lihat layanan"}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-lg border bg-background p-5 shadow-sm transition-transform duration-300 md:group-hover:[transform:perspective(900px)_rotateX(var(--about-tilt-x,0deg))_rotateY(var(--about-tilt-y,0deg))]">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {siteName}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {locale === "en" ? "Digital operating profile" : "Profil operasi digital"}
                    </p>
                  </div>
                  <MousePointer2 className="size-5 text-muted-foreground transition-transform duration-300 group-hover:rotate-12" />
                </div>

                <div className="grid grid-cols-2 gap-px bg-border">
                  {stats.map((item) => (
                    <div key={item.label} className="bg-background p-4">
                      <div className="text-2xl font-semibold tracking-tight text-foreground">{item.value}</div>
                      <div className="mt-1 text-xs leading-5 text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 text-xs text-muted-foreground">
                  <span>{locale === "en" ? "Move your cursor" : "Gerakkan cursor"}</span>
                  <span className="h-px flex-1 bg-border" />
                  <span>{locale === "en" ? "Interactive" : "Interaktif"}</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b py-16 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.34fr_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {locale === "en" ? "From DB content" : "Konten dari DB"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                {locale === "en" ? "Company story" : "Cerita perusahaan"}
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {locale === "en"
                  ? "This area renders the page body saved from the admin editor."
                  : "Area ini menampilkan isi halaman yang disimpan dari editor admin."}
              </p>
            </aside>

            <div className="min-w-0 border-l pl-6 sm:pl-8 lg:pl-12">
              {content ? (
                <PageContent content={content} />
              ) : (
                <div className="max-w-3xl text-base leading-8 text-muted-foreground">
                  {description}
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b py-16 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.42fr_minmax(0,1fr)] lg:items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {locale === "en" ? "Principles" : "Prinsip"}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {locale === "en" ? "Simple rules behind the work" : "Aturan sederhana di balik pekerjaan"}
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {values.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    onMouseEnter={() => setActiveValue(index)}
                    onFocus={() => setActiveValue(index)}
                    onClick={() => setActiveValue(index)}
                    className={`shrink-0 rounded-md border px-4 py-3 text-left text-sm font-medium transition-all duration-200 lg:w-full ${
                      activeValue === index
                        ? "bg-foreground text-background"
                        : "bg-background text-muted-foreground hover:-translate-y-0.5 hover:text-foreground"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              <div className="relative min-h-64 overflow-hidden rounded-lg border bg-background p-6">
                <div className="absolute inset-x-0 top-0 h-px bg-foreground transition-transform duration-500" />
                <ActiveIcon className="size-9 text-foreground" />
                <h3 className="mt-8 max-w-xl text-2xl font-semibold tracking-tight text-foreground">
                  {active.title}
                </h3>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                  {active.text}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_0.72fr] lg:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {locale === "en" ? "Next step" : "Langkah berikutnya"}
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {cta.heading}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                {cta.text}
              </p>
              <Button asChild className="mt-7 h-11 rounded-md px-5">
                <Link href={`/${locale}/contact`}>
                  {cta.button}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            {contactItems.length ? (
              <div className="divide-y border-y">
                {contactItems.map((item) => {
                  const Icon = item.icon;
                  const contentItem = (
                    <div className="flex items-start gap-4 py-4 transition-colors hover:text-foreground">
                      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="mt-1 break-words text-sm font-medium text-foreground">{item.value}</p>
                      </div>
                    </div>
                  );

                  return item.href ? (
                    <Link key={item.label} href={item.href}>
                      {contentItem}
                    </Link>
                  ) : (
                    <div key={item.label}>{contentItem}</div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </Container>
      </section>
    </main>
  );
}
