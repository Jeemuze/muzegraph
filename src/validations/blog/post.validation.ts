import { z } from "zod";

export const postTranslationSchema = z.object({
  languageId: z.string().min(1),
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().optional(),
  content: z.string().min(10),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
});

export const createPostSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  isFeatured: z.boolean().default(false),
  allowComments: z.boolean().default(true),
  readingTime: z.number().min(1).optional(),
  featuredImage: z.string().optional(),

  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),

  translations: z.array(postTranslationSchema).min(1),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
