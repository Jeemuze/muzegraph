export function getNavItems(locale: string) {
  if (locale === "en") {
    return [
      { label: "Home", href: `/${locale}` },
      { label: "About", href: `/${locale}/about` },
      { label: "Services", href: `/${locale}/services` },
      { label: "Portfolio", href: `/${locale}/portfolios` },
      { label: "Blog", href: `/${locale}/blog` },
      { label: "FAQ", href: `/${locale}/faq` },
      { label: "Contact", href: `/${locale}/contact` },
    ];
  }

  return [
    { label: "Beranda", href: `/${locale}` },
    { label: "Tentang", href: `/${locale}/about` },
    { label: "Layanan", href: `/${locale}/services` },
    { label: "Portofolio", href: `/${locale}/portfolios` },
    { label: "Blog", href: `/${locale}/blog` },
    { label: "FAQ", href: `/${locale}/faq` },
    { label: "Kontak", href: `/${locale}/contact` },
  ];
}
