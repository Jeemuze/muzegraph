import { NextRequest, NextResponse } from "next/server";
import { requirePermissionApi } from "@/lib/guards/auth";
import {
  getPortfolioTags,
  createPortfolioTag,
  ServiceError,
} from "@/lib/services/portfolio-tag.service";

export async function GET() {
  try {
    await requirePermissionApi("portfolio_tag.view");

    const data = await getPortfolioTags();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    const status =
      error instanceof ServiceError ? error.statusCode : 500;

    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Gagal mengambil data portfolio tag",
      },
      { status }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermissionApi("portfolio_tag.create");

    const body = await req.json();

    const data = await createPortfolioTag(body);

    return NextResponse.json(
      {
        success: true,
        message: "Portfolio tag berhasil dibuat",
        data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    const status =
      error instanceof ServiceError ? error.statusCode : 500;

    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Gagal membuat portfolio tag",
      },
      { status }
    );
  }
}
