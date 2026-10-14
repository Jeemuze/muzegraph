import { NextResponse } from "next/server";

import { requirePermissionApi } from "@/lib/guards/auth";
import {
  createPostTag,
  getPostTags,
} from "@/lib/services/post-tag.service";

export async function GET() {
  const guard = await requirePermissionApi(
    "manage_post_tags"
  );
  if (guard instanceof Response) return guard;

  try {
    const tags = await getPostTags();

    return NextResponse.json(tags);
  } catch (error) {
    console.error("GET POST TAGS ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil post tags" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const guard = await requirePermissionApi(
    "manage_post_tags"
  );
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json();

    const created = await createPostTag(body);

    return NextResponse.json(created);
  } catch (error) {
    console.error("CREATE POST TAG ERROR:", error);

    return NextResponse.json(
      { error: "Gagal membuat post tag" },
      { status: 500 }
    );
  }
}
