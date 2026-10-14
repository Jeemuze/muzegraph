import Navbar from "@/components/layout/public-navbar";
import Footer from "@/components/layout/footer";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/admin/providers/theme-provider";
import { RouteAlternateProvider } from "@/components/providers/route-alternate-provider";

const allowedLocales = ["id", "en"];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!allowedLocales.includes(locale)) {
    notFound();
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <RouteAlternateProvider>
        <Navbar locale={locale} />
        <main>{children}</main>
        <Footer locale={locale} />
      </RouteAlternateProvider>
    </ThemeProvider>
  );
}
