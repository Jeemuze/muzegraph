import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _req: Request,
  { params }: Props
) {
  const { id } = await params;

  await prisma.post.update({
    where: {
      id,
    },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });

  return NextResponse.json({
    success: true,
  });
}
