import { z } from "zod";

export const postCategorySchema = z.object({
  icon: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),

  translations: z.array(
    z.object({
      languageId: z.string().min(1),
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().nullable().optional(),
    })
  ).min(1),
});

export type PostCategoryInput = z.infer<
  typeof postCategorySchema
>;
