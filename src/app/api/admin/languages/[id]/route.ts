import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const language = await prisma.language.findUnique({
      where: { id },
    });

    if (!language) {
      return NextResponse.json(
        { error: "Language not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(language);
  } catch (error) {
    console.error("GET LANGUAGE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch language" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      code,
      name,
      nativeName,
      isDefault,
      isActive,
      order,
    } = body;

    if (isDefault) {
      await prisma.language.updateMany({
        data: {
          isDefault: false,
        },
      });
    }

    const updated = await prisma.language.update({
      where: { id },
      data: {
        code: code?.toLowerCase(),
        name,
        nativeName,
        isDefault,
        isActive,
        order,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("UPDATE LANGUAGE ERROR:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Language code already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update language" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const language = await prisma.language.findUnique({
      where: { id },
    });

    if (!language) {
      return NextResponse.json(
        { error: "Language not found" },
        { status: 404 }
      );
    }

    if (language.isDefault) {
      return NextResponse.json(
        { error: "Default language cannot be deleted" },
        { status: 400 }
      );
    }

    await prisma.language.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE LANGUAGE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete language" },
      { status: 500 }
    );
  }
}
