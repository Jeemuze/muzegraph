import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";

export async function PUT(req: Request) {
  const guard = await requirePermissionApi("manage_settings");
  if (guard instanceof Response) return guard;

  const body: { key: string; value: string }[] = await req.json();

  for (const item of body) {
    await prisma.siteSetting.upsert({
      where: { key: item.key },
      update: { value: item.value },
      create: { key: item.key, value: item.value },
    });
  }

  return NextResponse.json({ success: true });
}
