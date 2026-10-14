import { prisma } from "@/lib/prisma";
import { requirePermissionPage } from "@/lib/guards/auth";
import { MediaUploader } from "@/components/admin/media/media-uploader";
import { MediaGrid } from "@/components/admin/media/media-grid";
import {
  FileArchive,
  FileText,
  FileSpreadsheet,
  FileImage,
  PlayCircle,
  Link2,
} from "lucide-react";

export default async function MediaPage() {
  await requirePermissionPage("manage_media");

  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  });

  const countBy = (extensions: string[], type?: string) =>
    media.filter((item) => {
      const ext = item.name.split(".").pop()?.toLowerCase() || "";

      if (type) {
        return item.type === type;
      }

      return extensions.includes(ext);
    }).length;

  const totalZip = countBy(["zip", "rar", "7z"]);
  const totalPdf = countBy(["pdf"]);
  const totalDoc = countBy(["doc", "docx"]);
  const totalExcel = countBy(["xls", "xlsx", "csv"]);
  const totalImages = countBy(["png", "jpg", "jpeg", "webp"], "IMAGE");

  const totalYoutube = media.filter(
    (item) =>
      item.url.includes("youtube.com") || item.url.includes("youtu.be")
  ).length;

  const totalLinks = media.filter(
    (item) =>
      item.type === "FILE" &&
      item.url.startsWith("http") &&
      !item.url.includes("youtube.com") &&
      !item.url.includes("youtu.be")
  ).length;

  const stats = [
    {
      title: "ZIP / Archive",
      total: totalZip,
      icon: <FileArchive className="h-5 w-5" />,
    },
    {
      title: "PDF",
      total: totalPdf,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "DOC / Word",
      total: totalDoc,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Excel / CSV",
      total: totalExcel,
      icon: <FileSpreadsheet className="h-5 w-5" />,
    },
    {
      title: "PNG / JPG",
      total: totalImages,
      icon: <FileImage className="h-5 w-5" />,
    },
    {
      title: "YouTube",
      total: totalYoutube,
      icon: <PlayCircle className="h-5 w-5" />,
    },
    {
      title: "External Link",
      total: totalLinks,
      icon: <Link2 className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Media Manager
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola gambar, dokumen, arsip, dan link embed
          </p>
        </div>

        <div className="w-full lg:w-auto">
          <MediaUploader />
        </div>
      </div>

      {/* DETAIL STATS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {stats.map((item, i) => (
          <div
            key={i}
            className="rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              {item.icon}
            </div>

            <p className="text-xs text-muted-foreground">{item.title}</p>

            <h3
              className={`mt-2 text-2xl font-bold ${
                item.total === 0
                  ? "text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {item.total}
            </h3>
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="rounded-3xl border bg-card p-4 shadow-sm md:p-6">
        <MediaGrid media={media} />
      </div>
    </div>
  );
}
