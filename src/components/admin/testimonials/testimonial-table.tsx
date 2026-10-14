"use client";

import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  FileSearch,
  Star,
  CircleUser,
  MessageSquareQuote,
  Briefcase,
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

import DeleteTestimonialModal from "@/components/admin/testimonials/delete-testimonial-modal";
import Image from "next/image";

type Testimonial = {
  id: string;
  name: string;
  company?: string | null;
  role?: string | null;
  message?: string | null;
  image?: string | null;
  rating: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string | Date;
};

type Props = {
  testimonials: Testimonial[];
};

export default function TestimonialTable({
  testimonials = [],
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] =
    useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<Testimonial | null>(null);

  const filteredTestimonials = useMemo(() => {
    if (!search.trim()) return testimonials;

    return testimonials.filter((item) =>
      `${item.name} ${item.company || ""} ${
        item.role || ""
      } ${item.message || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [testimonials, search]);

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);

      const res = await fetch(
        `/api/admin/testimonials/${deleteTarget.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal menghapus");
        return;
      }

      toast.success("Testimonial berhasil dihapus");
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
              Testimonials
            </h1>
            <p className="text-sm text-muted-foreground">
              Currently showing{" "}
              {testimonials.length} testimonials.
            </p>
          </div>

          <Link href="/admin/testimonials/create">
            <Button className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Create Testimonial
            </Button>
          </Link>
        </div>

        {/* SEARCH */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search testimonial..."
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
                  <TableHead className="min-w-[280px]">
                    Client
                  </TableHead>
                  <TableHead className="min-w-[320px]">
                    Review
                  </TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredTestimonials.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-40 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <FileSearch className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            No testimonials found
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTestimonials.map(
                    (item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {index + 1}
                        </TableCell>

                        <TableCell className="min-w-[280px]">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-2xl border bg-muted/40">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                  <CircleUser className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">
                                {item.name}
                              </p>

                              <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                {item.company && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    {item.company}
                                  </span>
                                )}

                                {item.role && (
                                  <span>
                                    {item.role}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[320px]">
                          <p className="truncate text-sm text-muted-foreground">
                            {item.message || "-"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {Array.from({
                              length: item.rating,
                            }).map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 fill-current"
                              />
                            ))}
                          </div>
                        </TableCell>

                        <TableCell>
                          {item.isFeatured ? (
                            <Badge className="rounded-full">
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
                              href={`/admin/testimonials/${item.id}/edit`}
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

      <DeleteTestimonialModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deletingId === deleteTarget?.id}
        testimonialName={deleteTarget?.name || ""}
      />
    </>
  );
}
