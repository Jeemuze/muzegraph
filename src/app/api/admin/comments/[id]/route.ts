import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_blog");
  if (guard instanceof Response) return guard;

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!status || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const comment = await prisma.comment.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ success: true, data: comment });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermissionApi("manage_blog");
  if (guard instanceof Response) return guard;

  const { id } = await params;
  await prisma.comment.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
