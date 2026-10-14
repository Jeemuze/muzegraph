// app/api/admin/post-tags/meta/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({
      languages,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load metadata" },
      { status: 500 }
    );
  }
}
