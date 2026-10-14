"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { getNavItems } from "./nav-config";
import LanguageSwitcher from "./language-switcher";
import MobileNav from "./mobile-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  locale: string;
  siteName: string;
  logoDark?: string | null;
  logoLight?: string | null;
  alternatePaths?: Record<string, string>;
};

export default function PublicNavbarShell({ locale, siteName, logoDark, logoLight, alternatePaths }: Props) {
  const navItems = getNavItems(locale);
  const pathname = usePathname();
  const { setTheme, theme, resolvedTheme } = useTheme();
  const ctaItem = navItems[navItems.length - 1];
  const desktopNavItems = navItems.slice(0, -1);

  const logo = resolvedTheme === "dark" ? (logoDark || "/assets/logo-dark.png") : (logoLight || "/assets/logo-light.png");

  const isActive = (href: string) => {
    if (href === `/${locale}`) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <Link
          href={`/${locale}`}
          className="group inline-flex min-w-0 items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
        >
          {logo ? (
            <img src={logo} alt={siteName} className="h-7 w-auto shrink-0 object-contain" />
          ) : (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-[10px] font-bold leading-none text-foreground shadow-xs transition-colors group-hover:bg-muted/60">
              {siteName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="max-w-[10rem] truncate sm:max-w-[15rem]">
            {siteName}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {desktopNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors after:absolute after:inset-x-2.5 after:bottom-0 after:h-px after:origin-left after:bg-foreground after:transition-transform",
                isActive(item.href)
                  ? "text-foreground after:scale-x-100"
                  : "text-muted-foreground after:scale-x-0 hover:bg-muted/60 hover:text-foreground hover:after:scale-x-100"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-1 lg:flex">
          <LanguageSwitcher locale={locale} />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="size-8 rounded-md text-muted-foreground hover:text-foreground"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {ctaItem ? (
            <Button asChild variant="outline" size="default" className="ml-1 rounded-md bg-background px-3 shadow-xs">
              <Link href={ctaItem.href}>
                {ctaItem.label}
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="size-8 rounded-md text-muted-foreground hover:text-foreground"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <MobileNav
            locale={locale}
            siteName={siteName}
            logoDark={logoDark}
            logoLight={logoLight}
            alternatePaths={alternatePaths}
          />
        </div>
      </div>
    </header>
  );
}
