"use client";

import { DeleteBlogPostModal } from "@/components/admin/blog/delete-blog-post-modal";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Pencil,
  Star,
  CalendarDays,
  CheckCircle2,
  Eye,
  Clock3,
  Plus,
  FileSearch,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type BlogPost = {
  id: string;
  status: string;
  isFeatured: boolean;
  createdAt: string;
  publishedAt?: string | null;
  viewCount: number;
  readingTime: number;
  allowComments: boolean;
  thumbnail?: {
    url: string;
  } | null;
  author?: {
    name: string;
  } | null;
  translations: {
    title: string;
    slug: string;
  }[];
};

export default function BlogPostsTable() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchPosts() {
      try {
        const res = await fetch("/api/admin/blog/posts");
        const data = await res.json();

        if (!mounted) return;

        if (Array.isArray(data)) {
          setPosts(data);
        } else if (Array.isArray(data.data)) {
          setPosts(data.data);
        } else {
          setPosts([]);
        }
      } catch {
        toast.error("Gagal memuat data blog post");
        setPosts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPosts();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;

    return posts.filter((post) =>
      `${post.translations?.[0]?.title ?? ""} ${
        post.translations?.[0]?.slug ?? ""
      } ${post.status}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [posts, search]);

  const formatDate = (date?: string | null) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog</h1>
          <p className="text-sm text-muted-foreground">
            Currently showing {posts.length} posts in the system.
          </p>
        </div>

        <Link href="/admin/blog/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Blog
          </Button>
        </Link>
      </div>

      {/* SEARCH */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search blog posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">No</TableHead>
                <TableHead className="min-w-[560px]">Post</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>

                    {/* POST */}
                    <TableCell className="w-[560px] max-w-[560px]">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-24 animate-pulse rounded-2xl bg-muted" />

                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-[85%] animate-pulse rounded bg-muted" />
                          <div className="h-3 w-[35%] animate-pulse rounded bg-muted" />
                        </div>
                      </div>
                    </TableCell>

                    {/* META */}
                    <TableCell>
                      <div className="space-y-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      </div>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <div className="space-y-2">
                        <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
                        <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
                      </div>
                    </TableCell>

                    {/* DATES */}
                    <TableCell>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                        </div>

                        <div className="space-y-1">
                          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                        </div>
                      </div>
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <div className="h-9 w-9 animate-pulse rounded-xl bg-muted" />
                        <div className="h-9 w-9 animate-pulse rounded-xl bg-muted" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-40 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileSearch className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          No blog posts found
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your search or create a new
                          post.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post, index) => {
                  const translation = post.translations?.[0];

                  return (
                    <TableRow key={post.id}>
                      <TableCell>{index + 1}</TableCell>

                      {/* POST */}
                      <TableCell className="w-[560px] max-w-[560px]">
                        <div className="flex items-center gap-3">
                          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-sm">
                            {post.thumbnail?.url ? (
                              <Image
                                src={post.thumbnail.url}
                                alt={translation?.title || "Thumbnail"}
                                fill
                                sizes="96px"
                                className="object-cover"
                                priority={index === 0}
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                                No Image
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1 overflow-hidden">
                            <p
                              title={translation?.title || "-"}
                              className="whitespace-normal break-words text-sm font-semibold leading-snug text-foreground"
                            >
                              {translation?.title
                                ? translation.title.length > 85
                                  ? `${translation.title.slice(0, 85)}...`
                                  : translation.title
                                : "-"}
                            </p>

                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              By {post.author?.name || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* META */}
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            {post.viewCount} views
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />
                            {post.readingTime} min read
                          </div>

                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            {post.allowComments
                              ? "Comments On"
                              : "Comments Off"}
                          </div>
                        </div>
                      </TableCell>

                      {/* STATUS */}
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <span className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {post.status}
                          </span>

                          {post.isFeatured && (
                            <span className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                              <Star className="h-3.5 w-3.5" />
                              Featured
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* DATES */}
                      <TableCell>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Created
                            </p>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" />
                              {formatDate(post.createdAt)}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Published
                            </p>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" />
                              {formatDate(post.publishedAt)}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/blog/${post.id}/edit`}>
                            <Button size="icon" variant="ghost">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>

                          <DeleteBlogPostModal
                            postId={post.id}
                            postTitle={
                              translation?.title || "Untitled Post"
                            }
                            onDeleted={(deletedId) => {
                              setPosts((prev) =>
                                prev.filter(
                                  (item) => item.id !== deletedId
                                )
                              );
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
