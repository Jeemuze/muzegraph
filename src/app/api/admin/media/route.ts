import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermissionApi } from "@/lib/guards/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/* =========================
   HELPER FUNCTIONS
========================= */

function extractYouTubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/;

  const match = url.match(regex);
  return match ? match[1] : null;
}

async function getYouTubeTitle(url: string): Promise<string> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(
        url
      )}&format=json`
    );

    if (!res.ok) return "Embedded Video";

    const data = await res.json();
    return data.title || "Embedded Video";
  } catch {
    return "Embedded Video";
  }
}

function sanitizeFileName(name: string) {
  return name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}

/* =========================
   GET MEDIA
========================= */

export async function GET() {
  const guard = await requirePermissionApi("manage_media");
  if (guard instanceof Response) return guard;

  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("GET ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil media" },
      { status: 500 }
    );
  }
}

/* =========================
   POST MEDIA
========================= */

export async function POST(req: NextRequest) {
  const guard = await requirePermissionApi("manage_media");
  if (guard instanceof Response) return guard;

  try {
    const formData = await req.formData();

    const files = formData.getAll("file") as File[];
    const url = formData.get("url") as string | null;
    const typeInput = formData.get("type") as string | null;
    const nameInput = formData.get("name") as string | null;

    /* =========================
       HANDLE URL / EMBED
    ========================= */

    if (url?.trim()) {
      const youtubeId = extractYouTubeId(url);

      if (youtubeId) {
        const title = await getYouTubeTitle(url);

        const media = await prisma.media.create({
          data: {
            name: title,
            url: `https://www.youtube.com/embed/${youtubeId}`,
            type: "VIDEO",
            mimeType: "text/url",
            size: 0,
          },
        });

        return NextResponse.json({
          success: true,
          message: "YouTube berhasil disimpan",
          data: media,
        });
      }

      if (typeInput === "FILE" && !nameInput?.trim()) {
        return NextResponse.json(
          { error: "Nama link wajib diisi" },
          { status: 400 }
        );
      }

      const media = await prisma.media.create({
        data: {
          name: nameInput?.trim() || "External Link",
          url: url.trim(),
          type: typeInput === "VIDEO" ? "VIDEO" : "FILE",
          mimeType: "text/url",
          size: 0,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Link berhasil disimpan",
        data: media,
      });
    }

    /* =========================
       HANDLE FILE UPLOAD
    ========================= */

    if (!files.length || !files[0]) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    const createdMedia = [];

    for (const file of files) {
      if (!file || file.size === 0) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const safeFileName = sanitizeFileName(file.name);
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}-${safeFileName}`;

      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      let type: "IMAGE" | "FILE" | "VIDEO" = "FILE";

      if (file.type.startsWith("image")) {
        type = "IMAGE";
      } else if (file.type.startsWith("video")) {
        type = "VIDEO";
      }
      const media = await prisma.media.create({
        data: {
          name: file.name,
          url: `/uploads/${fileName}`,
          type,
          mimeType: file.type,
          size: file.size,
        },
      });
      createdMedia.push(media);
    }

    return NextResponse.json({
      success: true,
      message: `${createdMedia.length} file berhasil diupload`,
      data: createdMedia,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      { error: "Upload gagal" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE MEDIA
========================= */

export async function DELETE(req: NextRequest) {
  const guard = await requirePermissionApi("manage_media");
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json();
    const ids: string[] = body.ids || [];

    if (!ids.length) {
      return NextResponse.json(
        { error: "ID media tidak ditemukan" },
        { status: 400 }
      );
    }

    const mediaList = await prisma.media.findMany({
      where: {
        id: { in: ids },
      },
    });

    const fs = await import("fs/promises");

    for (const media of mediaList) {
      if (media.url.startsWith("/uploads/")) {
        const cleanPath = media.url.replace(/^\/+/, "");
        const filePath = path.join(process.cwd(), "public", cleanPath);

        try {
          await fs.unlink(filePath);
        } catch {
          // abaikan jika file tidak ada
        }
      }
    }

    await prisma.media.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Media berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Gagal menghapus media" },
      { status: 500 }
    );
  }
}
