import { NextRequest, NextResponse } from "next/server";
import { requirePermissionApi } from "@/lib/guards/auth";
import {
  getPortfolioTagById,
  updatePortfolioTag,
  deletePortfolioTag,
  ServiceError,
} from "@/lib/services/portfolio-tag.service";

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
    await requirePermissionApi("portfolio_tag.view");

    const { id } = await params;

    const data = await getPortfolioTagById(id);

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Tag tidak ditemukan",
        },
        { status: 404 }
      );
    }

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
        message: error.message || "Gagal mengambil detail tag",
      },
      { status }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    await requirePermissionApi("portfolio_tag.update");

    const { id } = await params;
    const body = await req.json();

    const data = await updatePortfolioTag(id, body);

    return NextResponse.json({
      success: true,
      message: "Tag berhasil diperbarui",
      data,
    });
  } catch (error: any) {
    const status =
      error instanceof ServiceError ? error.statusCode : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal update tag",
      },
      { status }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    await requirePermissionApi("portfolio_tag.delete");

    const { id } = await params;

    await deletePortfolioTag(id);

    return NextResponse.json({
      success: true,
      message: "Tag berhasil dihapus",
    });
  } catch (error: any) {
    const status =
      error instanceof ServiceError ? error.statusCode : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal menghapus tag",
      },
      { status }
    );
  }
}
