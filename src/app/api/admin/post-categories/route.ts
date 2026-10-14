import { NextResponse } from "next/server";

import {
  createPostCategory,
  getPostCategories,
} from "@/lib/services/post-category.service";

import {
  postCategorySchema,
} from "@/lib/validators/post-category.validator";

export async function GET() {
  const categories = await getPostCategories();

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const body = await req.json();

  const parsed =
    postCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.flatten(),
      },
      { status: 422 }
    );
  }

  const category = await createPostCategory(
    parsed.data
  );

  return NextResponse.json(category, {
    status: 201,
  });
}
