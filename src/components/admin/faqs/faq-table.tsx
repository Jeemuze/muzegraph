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
  MessageCircleQuestion,
  FolderTree,
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

import DeleteFaqModal from "@/components/admin/faqs/delete-faq-modal";

type Faq = {
  id: string;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: string | Date;
  category?: {
    translations?: {
      name: string;
    }[];
  } | null;
  translations?: {
    question: string;
    answer: string;
  }[];
};

type Props = {
  faqs: Faq[];
};

function extractAnswerText(answer?: string) {
  if (!answer) return "-";

  try {
    const parsed = JSON.parse(answer);

    function extractText(node: any): string {
      if (node?.text) return node.text;
      if (Array.isArray(node?.content)) {
        return node.content.map(extractText).join(" ");
      }
      return "";
    }

    if (parsed?.type === "doc" || Array.isArray(parsed)) {
      const nodes = parsed?.content || parsed;
      if (Array.isArray(nodes)) {
        return nodes.map(extractText).join(" ").trim() || "-";
      }
    }

    return answer;
  } catch {
    return answer;
  }
}

export default function FaqTable({ faqs = [] }: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);

  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return faqs;

    return faqs.filter((item) => {
      const question = item.translations?.[0]?.question || "";
      const answer = extractAnswerText(item.translations?.[0]?.answer || "");
      const category = item.category?.translations?.[0]?.name || "";

      return `${question} ${answer} ${category}`
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [faqs, search]);

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);

      const res = await fetch(`/api/admin/faqs/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal menghapus");
        return;
      }

      toast.success("FAQ berhasil dihapus");
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
            <h1 className="text-2xl font-bold">FAQs</h1>
            <p className="text-sm text-muted-foreground">
              Currently showing {faqs.length} FAQs.
            </p>
          </div>

          <Link href="/admin/faqs/create">
            <Button className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Create FAQ
            </Button>
          </Link>
        </div>

        {/* SEARCH */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search FAQ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                  <TableHead className="max-w-[400px]">Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredFaqs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FileSearch className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">No FAQs found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFaqs.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>

                      <TableCell className="max-w-[400px]">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 rounded-xl bg-muted p-2">
                            <MessageCircleQuestion className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 space-y-1">
                            <p className="font-semibold line-clamp-1">
                              {item.translations?.[0]?.question || "-"}
                            </p>

                            <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                              {extractAnswerText(
                                item.translations?.[0]?.answer
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FolderTree className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {item.category?.translations?.[0]?.name ||
                              "No Category"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="rounded-full">
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
                          <Badge variant="outline" className="rounded-full">
                            No
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={item.isActive ? "default" : "destructive"}
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
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/faqs/${item.id}/edit`}>
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
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <DeleteFaqModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deletingId === deleteTarget?.id}
        faqQuestion={deleteTarget?.translations?.[0]?.question || ""}
      />
    </>
  );
}
