"use client";

import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  FileSearch,
  Star,
  Briefcase,
  MapPin,
  CalendarDays,
  FolderKanban,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import DeletePortfolioModal from "@/components/admin/portfolios/delete-portfolio-modal";

type Portfolio = {
  id: string;
  slug: string;
  clientName?: string | null;
  industry?: string | null;
  location?: string | null;
  completedAt?: string | Date | null;
  coverImage?: {
    url: string;
  } | null;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: string | Date;
  translations?: {
    title: string;
    excerpt?: string | null;
  }[];
};

type Props = {
  portfolios: Portfolio[];
};

export default function PortfolioTable({
  portfolios = [],
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] =
    useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<Portfolio | null>(null);

  const filteredPortfolios = useMemo(() => {
    if (!search.trim()) return portfolios;

    return portfolios.filter((item) =>
      `${item.clientName || ""} ${item.industry || ""} ${item.location || ""
        } ${item.translations?.[0]?.title || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [portfolios, search]);

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);

      const res = await fetch(
        `/api/admin/portfolios/${deleteTarget.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal menghapus");
        return;
      }

      toast.success("Portfolio berhasil dihapus");
      setDeleteTarget(null);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Portfolios
            </h1>
            <p className="text-sm text-muted-foreground">
              Currently showing {portfolios.length} portfolios.
            </p>
          </div>

          <Link href="/admin/portfolios/create">
            <Button className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Create Portfolio
            </Button>
          </Link>
        </div>

        {/* SEARCH */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search portfolio..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="rounded-xl pl-9"
          />
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead className="min-w-[320px]">
                    Project
                  </TableHead>
                  <TableHead className="min-w-[280px]">
                    Details
                  </TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredPortfolios.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-40 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <FileSearch className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            No portfolios found
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPortfolios.map(
                    (item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {index + 1}
                        </TableCell>

                        <TableCell className="min-w-[320px]">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-2xl border bg-muted/40">
                              {item.coverImage?.url ? (
                                <Image
                                  src={item.coverImage.url}
                                  alt={item.translations?.[0]?.title || "Portfolio"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                  <FolderKanban className="h-5 w-5" />
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <p className="font-semibold">
                                {item.translations?.[0]
                                  ?.title || "-"}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {item.slug}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="max-w-[280px]">
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {item.clientName && (
                              <div className="flex items-center gap-2 truncate">
                                <Briefcase className="h-3.5 w-3.5" />
                                <span className="truncate">
                                  {item.clientName}
                                </span>
                              </div>
                            )}

                            {item.location && (
                              <div className="flex items-center gap-2 truncate">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="truncate">
                                  {item.location}
                                </span>
                              </div>
                            )}

                            {item.completedAt && (
                              <div className="flex items-center gap-2">
                                <CalendarDays className="h-3.5 w-3.5" />
                                <span>
                                  {new Date(
                                    item.completedAt
                                  ).toLocaleDateString(
                                    "id-ID",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className="rounded-full"
                          >
                            {item.order}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {item.isFeatured ? (
                            <Badge className="rounded-full">
                              <Star className="mr-1 h-3.5 w-3.5" />
                              Featured
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="rounded-full"
                            >
                              No
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              item.isActive
                                ? "default"
                                : "destructive"
                            }
                            className="rounded-full"
                          >
                            {item.isActive ? (
                              <>
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-1 h-3.5 w-3.5" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            {new Date(
                              item.createdAt
                            ).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/portfolios/${item.id}/edit`}
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-xl"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>

                            <Button
                              size="icon"
                              variant="ghost"
                              className="rounded-xl text-destructive"
                              onClick={() =>
                                setDeleteTarget(item)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <DeletePortfolioModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deletingId === deleteTarget?.id}
        portfolioName={
          deleteTarget?.translations?.[0]?.title || ""
        }
      />
    </>
  );
}
