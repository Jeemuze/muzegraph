import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await prisma.seo.findFirst();

  const baseUrl = seo?.siteUrl || "http://localhost:3000";

  const pages = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/services", priority: 0.8, changeFrequency: "weekly" },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  ];

  return pages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency as any,
    priority: page.priority,
  }));
}
