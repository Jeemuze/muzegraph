import { getContent } from "@/lib/content";
import PublicNavbarShell from "./public-navbar-shell";

type Props = {
  locale: string;
  alternatePaths?: Record<string, string>;
};

export default async function PublicNavbar({
  locale,
  alternatePaths,
}: Props) {
  const content = await getContent();

  return (
    <PublicNavbarShell
      locale={locale}
      siteName={content.site.name}
      logoDark={content.site.logoDark}
      logoLight={content.site.logoLight}
      alternatePaths={alternatePaths}
    />
  );
}
