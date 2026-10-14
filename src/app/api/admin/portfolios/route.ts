import { NextRequest, NextResponse } from "next/server";
import { requirePermissionApi } from "@/lib/guards/auth";
import {
  getPortfolios,
  createPortfolio,
} from "@/lib/services/portfolio.service";

export async function GET() {
  try {
    await requirePermissionApi("portfolio.view");

    const data = await getPortfolios();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengambil data portfolio",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermissionApi("portfolio.create");

    const body = await req.json();

    const data = await createPortfolio(body);

    return NextResponse.json({
      success: true,
      message: "Portfolio berhasil dibuat",
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal membuat portfolio",
      },
      { status: 500 }
    );
  }
}
