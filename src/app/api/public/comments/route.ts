import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { postId, parentId, authorName, authorEmail, content } = body;

  if (!postId || !authorName || !authorEmail || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Check post exists and allows comments
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { allowComments: true } });
  if (!post || !post.allowComments) {
    return NextResponse.json({ error: "Comments not allowed" }, { status: 403 });
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      parentId: parentId || null,
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim().toLowerCase(),
      content: content.trim(),
      status: "PENDING",
      isAdmin: false,
    },
  });

  return NextResponse.json({ success: true, comment: { id: comment.id } }, { status: 201 });
}
