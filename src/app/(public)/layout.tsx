import { Metadata } from "next";
import Script from "next/script";
import { prisma } from "@/lib/prisma";

import {
  getOrganizationSchema,
  getWebsiteSchema,
  getServiceSchemas,
} from "@/lib/schema";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await prisma.seo.findFirst();

  const baseUrl = seo?.siteUrl || "http://localhost:3000";

  return {
    metadataBase: new URL(baseUrl),

    title: {
      default: seo?.title || "Website",
      template: `%s | ${seo?.siteName || "Website"}`,
    },

    description: seo?.description || "",

    keywords: seo?.keywords?.split(",").map((k) => k.trim()) || [],

    alternates: {
      canonical: baseUrl,
    },

    openGraph: {
      title: seo?.ogTitle || seo?.title || "",
      description: seo?.ogDescription || seo?.description || "",
      url: baseUrl,
      siteName: seo?.siteName || "",
      images: [
        {
          url: seo?.ogImage || "/og-image.png",
          width: 1200,
          height: 630,
        },
      ],
      locale: "id_ID",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: seo?.twitterTitle || seo?.title || "",
      description: seo?.twitterDescription || seo?.description || "",
      images: [seo?.twitterImage || "/og-image.png"],
    },

    robots: seo?.robots || "index, follow",

    icons: {
      icon: seo?.favicon || "/assets/favicon.png",
    },
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [orgSchema, webSchema, serviceSchemas] = await Promise.all([
    getOrganizationSchema(),
    getWebsiteSchema(),
    getServiceSchemas(),
  ]);

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSchema) }}
      />

      {serviceSchemas.map((schema, i) => (
        <Script
          key={i}
          id={`service-schema-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {children}
    </>
  );
}
