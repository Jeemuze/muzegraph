import content from "@/content/content.json";
import { Metadata } from "next";

type PageKey = keyof typeof content.pages;

export function generateSEO(page: PageKey): Metadata {
  const baseUrl = content.site.url;
  const data = content.pages[page];

  if (!data) {
    return {
      title: content.seo.title,
      description: content.seo.description,
    };
  }

  const fullUrl = `${baseUrl}${data.path}`;

  return {
    title: data.title,
    description: data.description,
    keywords: content.seo.keywords,

    metadataBase: new URL(baseUrl),

    alternates: {
      canonical: fullUrl,
    },

    openGraph: {
      title: data.title,
      description: data.description,
      url: fullUrl,
      siteName: content.site.name,
      images: [
        {
          url: content.seo.openGraph.image,
          width: 1200,
          height: 630,
        },
      ],
      locale: content.site.locale,
      type: "website",
    },

    twitter: {
      card: content.seo.twitter.card as "summary" | "summary_large_image" | "player" | "app",
      title: data.title,
      description: data.description,
      images: [content.seo.twitter.image],
    },

    robots: content.seo.robots,
  };
}
