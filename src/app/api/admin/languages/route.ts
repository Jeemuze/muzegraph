import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(languages);
  } catch (error) {
    console.error("GET LANGUAGES ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch languages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      code,
      name,
      nativeName,
      isDefault = false,
      isActive = true,
      order = 0,
    } = body;

    if (!code || !name || !nativeName) {
      return NextResponse.json(
        { error: "Code, name, and nativeName are required" },
        { status: 400 }
      );
    }

    if (isDefault) {
      await prisma.language.updateMany({
        data: {
          isDefault: false,
        },
      });
    }

    const language = await prisma.language.create({
      data: {
        code: code.toLowerCase(),
        name,
        nativeName,
        isDefault,
        isActive,
        order,
      },
    });

    return NextResponse.json(language, { status: 201 });
  } catch (error: any) {
    console.error("CREATE LANGUAGE ERROR:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Language code already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create language" },
      { status: 500 }
    );
  }
}
