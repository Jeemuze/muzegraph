import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";

export async function GET() {
  const guard = await requirePermissionApi("manage_blog");
  if (guard instanceof Response) return guard;

  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { translations: { select: { title: true, slug: true }, take: 1 } } },
      parent: { select: { authorName: true } },
    },
  });

  return NextResponse.json({ success: true, data: comments });
}

// Admin reply to a comment
export async function POST(req: Request) {
  const guard = await requirePermissionApi("manage_blog");
  if (guard instanceof Response) return guard;

  const body = await req.json();
  const { parentId, content } = body;

  if (!parentId || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const parent = await prisma.comment.findUnique({ where: { id: parentId }, select: { postId: true } });
  if (!parent) {
    return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: {
      postId: parent.postId,
      parentId,
      authorName: "Admin",
      authorEmail: "admin@mail.com",
      content: content.trim(),
      status: "APPROVED",
      isAdmin: true,
    },
  });

  return NextResponse.json({ success: true, data: comment }, { status: 201 });
}
