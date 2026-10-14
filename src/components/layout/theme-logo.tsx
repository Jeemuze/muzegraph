"use client";

import { useTheme } from "next-themes";

type Props = {
  logoDark?: string | null;
  logoLight?: string | null;
  siteName: string;
  className?: string;
  fallbackClassName?: string;
};

export function ThemeLogo({ logoDark, logoLight, siteName, className, fallbackClassName }: Props) {
  const { resolvedTheme } = useTheme();
  const logo = resolvedTheme === "dark"
    ? (logoDark || "/assets/logo-dark.png")
    : (logoLight || "/assets/logo-light.png");

  return <img src={logo} alt={siteName} className={className} />;
}
