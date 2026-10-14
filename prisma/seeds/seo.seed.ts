import { PrismaClient } from "@prisma/client";

export async function seedSeo(prisma: PrismaClient) {
  const seoExists = await prisma.seo.findFirst();

  if (!seoExists) {
    await prisma.seo.create({
      data: {
        siteName: "Mulaidigital",
        siteUrl: "https://mulaidigital.com",
        siteLogo: "/assets/logo-dark.png",
        title: "Jasa Website Company Profile & Landing Page - Mulaidigital",
        description:
          "Mulaidigital menyediakan jasa pembuatan website company profile dan landing page.",
        keywords: "jasa website, landing page, company profile",
        robots: "index, follow",
        ogTitle: "Jasa Website Modern",
        ogDescription: "Website siap pakai untuk UMKM",
        ogImage: "/og-image.png",
        twitterTitle: "Mulaidigital",
        twitterDescription: "Solusi website modern",
        twitterImage: "/og-image.png",
      },
    });

    console.log("✅ SEO seeded");
  } else {
    console.log("⚠️ SEO already exists, skip");
  }
}
