"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Languages } from "lucide-react";

import { useRouteAlternate } from "@/components/providers/route-alternate-provider";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type Props = {
  locale: string;
};

export default function LanguageSwitcher({
  locale,
}: Props) {
  const pathname = usePathname();

  // ambil dari context, bukan props
  const { alternatePaths } = useRouteAlternate();

  const switchPath = (newLocale: string) => {
    if (alternatePaths?.[newLocale]) {
      return alternatePaths[newLocale];
    }

    const segments = pathname.split("/");

    if (segments.length > 1) {
      segments[1] = newLocale;
    }

    return segments.join("/") || `/${newLocale}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="default"
          className="rounded-md px-2.5 text-muted-foreground hover:text-foreground"
        >
          <Languages className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase">
            {locale}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44 rounded-md">
        <DropdownMenuItem asChild>
          <Link href={switchPath("id")} className="justify-between">
            <span>Bahasa Indonesia</span>
            {locale === "id" ? <Check className="size-4" /> : null}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={switchPath("en")} className="justify-between">
            <span>English</span>
            {locale === "en" ? <Check className="size-4" /> : null}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
