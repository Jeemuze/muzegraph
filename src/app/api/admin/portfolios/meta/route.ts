import { NextResponse } from "next/server";
import { requirePermissionApi } from "@/lib/guards/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requirePermissionApi("portfolio.view");

    const [languages, tags] = await Promise.all([
      prisma.language.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          code: true,
          name: true,
          isDefault: true,
          isActive: true,
          order: true,
        },
      }),

      prisma.portfolioTag.findMany({
        include: {
          translations: {
            include: {
              language: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return NextResponse.json({
      languages,
      tags,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Failed to load portfolio metadata",
      },
      { status: 500 }
    );
  }
}
