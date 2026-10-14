import { z } from "zod";

export const heroTranslationSchema = z.object({
  languageId: z.string().min(1),
  title: z.string().min(1, "Title wajib diisi").max(200),
  subtitle: z.string().max(300).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  ctaPrimaryText: z.string().max(50).nullable().optional(),
  ctaSecondaryText: z.string().max(50).nullable().optional(),
});

export const heroSchema = z.object({
  type: z.enum(["STATIC", "SLIDER", "VIDEO"]).optional(),
  imageId: z.string().nullable().optional(),
  imageIds: z.array(z.string()).optional(),
  videoUrl: z.string().url().nullable().optional().or(z.literal("")),
  ctaPrimaryUrl: z.string().max(500).nullable().optional(),
  ctaSecondaryUrl: z.string().max(500).nullable().optional(),
  overlayOpacity: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  translations: z.array(heroTranslationSchema).min(1, "Minimal 1 translation"),
});

export type HeroInput = z.infer<typeof heroSchema>;
