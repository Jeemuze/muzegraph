import { requirePermissionApi } from "@/lib/guards/auth";
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const guard = await requirePermissionApi("manage_service");
  if (guard instanceof Response) return guard;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    // validasi hanya image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Hanya file gambar yang diperbolehkan" },
        { status: 400 }
      );
    }

    // max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public/uploads/editor");

    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({
      url: `/uploads/editor/${filename}`,
    });
  } catch (error) {
    console.error("UPLOAD EDITOR ERROR:", error);

    return NextResponse.json(
      { error: "Upload gagal" },
      { status: 500 }
    );
  }
}
