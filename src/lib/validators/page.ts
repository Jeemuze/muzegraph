import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const pageTranslationSchema = z.object({
  languageId: z.string().min(1, "Language ID wajib diisi"),
  title: z.string().min(1, "Title wajib diisi").max(200),
  excerpt: z.string().max(500).nullable().optional(),
  metaTitle: z.string().max(70).nullable().optional(),
  metaDescription: z.string().max(160).nullable().optional(),
  ogImage: z.string().url().nullable().optional().or(z.literal("")),
  canonicalUrl: z.string().url().nullable().optional().or(z.literal("")),
});

export const createPageSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .max(200)
    .regex(slugRegex, "Slug hanya boleh huruf kecil, angka, dan strip"),
  template: z.string().max(50).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  isHomePage: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional().or(z.literal("")),
  ogImage: z.string().url().nullable().optional().or(z.literal("")),
  structuredData: z.any().optional(),
  translations: z.array(pageTranslationSchema).min(1, "Minimal 1 translation"),
});

export const updatePageSchema = createPageSchema;

export const seoSchema = z.object({
  siteName: z.string().max(100).nullable().optional(),
  siteUrl: z.string().max(500).nullable().optional(),
  siteLogo: z.string().max(500).nullable().optional(),
  siteLogoDark: z.string().max(500).nullable().optional(),
  siteLogoLight: z.string().max(500).nullable().optional(),
  favicon: z.string().max(500).nullable().optional(),
  title: z.string().max(70).nullable().optional(),
  description: z.string().max(160).nullable().optional(),
  keywords: z.string().max(500).nullable().optional(),
  robots: z.string().max(100).nullable().optional(),
  canonicalUrl: z.string().max(500).nullable().optional(),
  locale: z.string().max(10).nullable().optional(),
  ogTitle: z.string().max(70).nullable().optional(),
  ogDescription: z.string().max(200).nullable().optional(),
  ogImage: z.string().max(500).nullable().optional(),
  ogType: z.string().max(50).nullable().optional(),
  twitterCard: z.string().max(50).nullable().optional(),
  twitterTitle: z.string().max(70).nullable().optional(),
  twitterDescription: z.string().max(200).nullable().optional(),
  twitterImage: z.string().max(500).nullable().optional(),
  twitterSite: z.string().max(100).nullable().optional(),
  structuredData: z.any().optional(),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type SeoInput = z.infer<typeof seoSchema>;
