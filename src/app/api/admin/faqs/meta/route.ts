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

    const categories = await prisma.faqCategory.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
      include: {
        translations: true,
      },
    });

    return NextResponse.json({
      languages,
      categories,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load metadata" },
      { status: 500 }
    );
  }
}
