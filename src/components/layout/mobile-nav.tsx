"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowRight, Menu, Moon, Sun } from "lucide-react";
import { getNavItems } from "./nav-config";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Props = {
  locale: string;
  siteName: string;
  logoDark?: string | null;
  logoLight?: string | null;
  alternatePaths?: Record<string, string>;
};

export default function MobileNav({ locale, siteName, logoDark, logoLight, alternatePaths }: Props) {
  const pathname = usePathname();
  const navItems = getNavItems(locale);
  const { setTheme, theme, resolvedTheme } = useTheme();
  const ctaItem = navItems[navItems.length - 1];

  const logo = resolvedTheme === "dark" ? (logoDark || "/assets/logo-dark.png") : (logoLight || "/assets/logo-light.png");

  const isActive = (href: string) => {
    if (href === `/${locale}`) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const switchLocale = (newLocale: string) => {
    if (alternatePaths?.[newLocale]) return alternatePaths[newLocale];
    const segments = pathname.split("/");
    segments[1] = newLocale;
    return segments.join("/");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 rounded-md">
          <Menu className="size-4" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[min(21rem,calc(100vw-2rem))] gap-0 p-0">
        <SheetHeader className="border-b px-4 py-3 text-left">
          <SheetTitle className="flex items-center gap-2.5">
            {logo ? (
              <img src={logo} alt={siteName} className="h-7 w-auto shrink-0 object-contain" />
            ) : (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-[10px] font-bold leading-none text-foreground shadow-xs">
                {siteName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="min-w-0 truncate text-sm font-semibold">
              {siteName}
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems.map((item) => (
            <SheetClose key={item.href} asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-muted/70 text-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <span>{item.label}</span>
              </Link>
            </SheetClose>
          ))}
        </nav>

        <SheetFooter className="gap-3 border-t p-4">
          {ctaItem ? (
            <SheetClose asChild>
              <Button asChild variant="outline" className="h-9 w-full rounded-md bg-background">
                <Link href={ctaItem.href}>
                  {ctaItem.label}
                  <ArrowRight data-icon="inline-end" className="size-4" />
                </Link>
              </Button>
            </SheetClose>
          ) : null}

          <Separator />

          <div className="flex items-center justify-between gap-3">
            <div className="grid grid-cols-2 rounded-md border bg-background p-0.5">
              {["id", "en"].map((item) => (
                <SheetClose key={item} asChild>
                  <Link
                    href={switchLocale(item)}
                    className={cn(
                      "rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-center text-xs font-medium uppercase transition-colors",
                      locale === item
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item}
                  </Link>
                </SheetClose>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="size-8 rounded-md"
            >
              <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
