import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const guard = await requirePermissionApi("manage_users");
  if (guard instanceof Response) return guard;

  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
