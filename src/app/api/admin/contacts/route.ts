import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";

export async function GET() {
  const guard = await requirePermissionApi("manage_blog");
  if (guard instanceof Response) return guard;

  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, data: messages });
}
