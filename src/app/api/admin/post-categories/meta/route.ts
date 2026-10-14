import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    const parents = await prisma.postCategory.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      languages,
      parents,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load metadata",
      },
      {
        status: 500,
      }
    );
  }
}
