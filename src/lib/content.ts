import { prisma } from "@/lib/prisma";

export async function getContent() {
  const seo = await prisma.seo.findFirst();

  return {
    site: {
      name: seo?.siteName || "Website",
      url: seo?.siteUrl || "http://localhost:3000",
      logo: seo?.siteLogo || null,
      logoDark: seo?.siteLogoDark || seo?.siteLogo || "/assets/logo-dark.png",
      logoLight: seo?.siteLogoLight || seo?.siteLogo || "/assets/logo-light.png",
    },

    seo: {
      title: seo?.title || "",
      description: seo?.description || "",
      keywords: seo?.keywords?.split(",").map((k) => k.trim()) || [],
      robots: seo?.robots || "index, follow",

      openGraph: {
        title: seo?.ogTitle || "",
        description: seo?.ogDescription || "",
        image: seo?.ogImage || "/og-image.png",
      },

      twitter: {
        title: seo?.twitterTitle || "",
        description: seo?.twitterDescription || "",
        image: seo?.twitterImage || "/og-image.png",
      },
    },
  };
}
