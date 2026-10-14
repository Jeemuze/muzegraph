import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await prisma.seo.findFirst();

  const baseUrl = seo?.siteUrl || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",

        allow: ["/"],

        disallow: [
          "/admin",
          "/api",
          "/_next",
        ],
      },
    ],

    sitemap: `${baseUrl}/sitemap.xml`,

    host: baseUrl,
  };
}
