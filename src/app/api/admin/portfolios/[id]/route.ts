import { NextRequest, NextResponse } from "next/server";
import { requirePermissionApi } from "@/lib/guards/auth";
import {
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
} from "@/lib/services/portfolio.service";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    await requirePermissionApi("portfolio.view");

    const { id } = await params;

    const data = await getPortfolioById(id);

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Portfolio tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengambil detail portfolio",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    await requirePermissionApi("portfolio.update");

    const { id } = await params;
    const body = await req.json();

    const data = await updatePortfolio(id, body);

    return NextResponse.json({
      success: true,
      message: "Portfolio berhasil diperbarui",
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memperbarui portfolio",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    await requirePermissionApi("portfolio.delete");

    const { id } = await params;

    await deletePortfolio(id);

    return NextResponse.json({
      success: true,
      message: "Portfolio berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal menghapus portfolio",
      },
      { status: 500 }
    );
  }
}
