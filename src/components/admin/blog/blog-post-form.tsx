"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Save,
  Globe,
  Settings,
  Image as ImageIcon,
  Tags,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TiptapEditor } from "@/components/editor/tiptap-dynamic";
import { MediaPicker } from "@/components/admin/media/media-picker";

import { generateSlug } from "@/lib/utils/slug";

type FormMode = "create" | "edit";

type Translation = {
  languageId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  slugTouched?: boolean;
};

type MetaData = {
  languages: {
    id: string;
    code: string;
    name: string;
    isDefault?: boolean;
  }[];
  categories: {
    id: string;
    translations: {
      name: string;
    }[];
  }[];
  tags: {
    id: string;
    translations: {
      name: string;
    }[];
  }[];
};

export default function BlogPostForm({ mode }: { mode: FormMode }) {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const [meta, setMeta] = useState<MetaData | null>(null);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [form, setForm] = useState({
    status: "DRAFT",
    publishedAt: "",
    isFeatured: false,
    allowComments: true,
    readingTime: 5,
    thumbnailId: "",
    featuredMediaIds: [] as string[],
    categoryIds: [] as string[],
    tagIds: [] as string[],
    translations: [] as Translation[],
  });

  const defaultLanguage = useMemo(() => {
    return meta?.languages?.find((l) => l.isDefault)?.id || "";
  }, [meta]);

  useEffect(() => {
    async function initializeForm() {
      try {
        setInitialized(false);

        const metaRes = await fetch("/api/admin/blog/meta");
        const metaData = await metaRes.json();

        if (!metaRes.ok) {
          toast.error(metaData.error || "Failed to load metadata");
          return;
        }

        setMeta(metaData);

        const defaultLang =
          metaData.languages.find((l: any) => l.isDefault) ||
          metaData.languages[0];

        if (defaultLang) {
          setActiveTab(defaultLang.id);
        }

        if (mode === "create") {
          setForm({
            status: "DRAFT",
            publishedAt: "",
            isFeatured: false,
            allowComments: true,
            readingTime: 5,
            thumbnailId: "",
            featuredMediaIds: [],
            categoryIds: [],
            tagIds: [],
            translations: metaData.languages.map((lang: any) => ({
              languageId: lang.id,
              title: "",
              slug: "",
              excerpt: "",
              content: "[]",
              metaTitle: "",
              metaDescription: "",
              keywords: "",
              slugTouched: false,
            })),
          });

          setInitialized(true);
          return;
        }

        if (mode === "edit" && postId) {
          const postRes = await fetch(`/api/admin/blog/posts/${postId}`);
          const postData = await postRes.json();

          if (!postRes.ok) {
            toast.error(postData.error || "Failed to load post");
            return;
          }

          const mergedTranslations = metaData.languages.map((lang: any) => {
            const existing = postData.translations?.find(
              (t: any) => t.languageId === lang.id
            );

            return {
              languageId: lang.id,
              title: existing?.title || "",
              slug: existing?.slug || "",
              excerpt: existing?.excerpt || "",
              content: existing?.content || "[]",
              metaTitle: existing?.metaTitle || "",
              metaDescription: existing?.metaDescription || "",
              keywords: existing?.keywords || "",
              slugTouched:
                !!existing?.slug &&
                existing.slug !== generateSlug(existing?.title || ""),
            };
          });

          setForm({
            status: postData.status || "DRAFT",
            publishedAt: postData.publishedAt
              ? new Date(postData.publishedAt).toISOString().slice(0, 16)
              : "",
            isFeatured: !!postData.isFeatured,
            allowComments:
              postData.allowComments !== undefined
                ? postData.allowComments
                : true,
            readingTime: postData.readingTime || 5,
            thumbnailId: postData.thumbnail?.id || "",
            featuredMediaIds:
              postData.featuredMedia?.map((item: any) => item.media.id) || [],
            categoryIds:
              postData.categories?.map((item: any) => item.categoryId) || [],
            tagIds:
              postData.tags?.map((item: any) => item.tagId) || [],
            translations: mergedTranslations,
          });
        }

        setInitialized(true);
      } catch {
        toast.error("Initialization failed");
      }
    }

    initializeForm();
  }, [mode, postId]);

  function updateTranslation(
    languageId: string,
    field: keyof Translation,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      translations: prev.translations.map((t) => {
        if (t.languageId !== languageId) return t;

        if (field === "title") {
          return {
            ...t,
            title: value,
            slug: t.slugTouched ? t.slug : generateSlug(value),
          };
        }

        if (field === "slug") {
          const cleanSlug = generateSlug(value);

          return {
            ...t,
            slug: cleanSlug,
            slugTouched: cleanSlug.length > 0,
          };
        }

        return {
          ...t,
          [field]: value,
        };
      }),
    }));
  }

  function getTranslation(languageId: string) {
    return form.translations.find((t) => t.languageId === languageId);
  }

  function toggleSelection(
    key: "categoryIds" | "tagIds",
    id: string,
    checked: boolean
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: checked
        ? Array.from(new Set([...prev[key], id]))
        : prev[key].filter((item) => item !== id),
    }));
  }

async function handleSubmit() {
  const defaultTranslation = form.translations.find(
    (t) => t.languageId === defaultLanguage
  );

  if (!defaultTranslation?.title.trim()) {
    toast.error("Default title is required");
    return;
  }

  const hasEmptySlug = form.translations.some(
    (t) => t.title.trim() && !t.slug.trim()
  );

  if (hasEmptySlug) {
    toast.error("Slug cannot be empty");
    return;
  }

  setLoading(true);

  try {
    const payload = {
      ...form,
      translations: form.translations.map(
        ({ slugTouched, ...rest }) => rest
      ),
    };

    const endpoint =
      mode === "edit"
        ? `/api/admin/blog/posts/${postId}`
        : "/api/admin/blog/posts";

    const method = mode === "edit" ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Save failed");
      return;
    }

    toast.success(
      mode === "edit"
        ? "Post updated successfully"
        : "Post created successfully"
    );

    router.push("/admin/blog");
    router.refresh();
  } finally {
    setLoading(false);
  }
}

  if (!initialized || !meta) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentTranslation = getTranslation(activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
<div className="sticky top-0 z-30 -mx-6 mb-6 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {mode === "create" ? "Create Blog Post" : "Edit Blog Post"}
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Kelola konten blog dengan tampilan modern & SEO-friendly.
      </p>
    </div>

    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push("/admin/blog")}
        className="rounded-xl"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="rounded-xl"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        {loading ? "Saving..." : "Save Post"}
      </Button>
    </div>
  </div>
</div>

      {/* Layout */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Main */}
        <div className="space-y-6">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <h2 className="font-semibold">Translations</h2>
            </div>

<Tabs
  value={activeTab}
  onValueChange={setActiveTab}
  className="mb-6"
>
  <TabsList className="inline-flex h-auto flex-wrap gap-2 bg-transparent p-0">
    {meta.languages.map((lang) => (
      <TabsTrigger
        key={lang.id}
        value={lang.id}
        className="
          h-10 rounded-full border border-border
          bg-background px-4 text-xs font-semibold
          text-muted-foreground shadow-sm
          transition-all
          data-[state=active]:bg-primary
          data-[state=active]:text-primary-foreground
          data-[state=active]:border-primary
        "
      >
        {lang.code.toUpperCase()}
      </TabsTrigger>
    ))}
  </TabsList>
</Tabs>
              <div className="space-y-2">
                <Label>Post Title</Label>
                <Input
                  placeholder="Enter post title"
                  value={currentTranslation?.title || ""}
                onChange={(e) =>
                  updateTranslation(activeTab, "title", e.target.value)
                }
              />

              <Input
                placeholder="Slug"
                value={currentTranslation?.slug || ""}
                onChange={(e) =>
                  updateTranslation(activeTab, "slug", e.target.value)
                }
              />

              <Input
                placeholder="Excerpt"
                value={currentTranslation?.excerpt || ""}
                onChange={(e) =>
                  updateTranslation(activeTab, "excerpt", e.target.value)
                }
              />

              <TiptapEditor
                key={activeTab}
                value={currentTranslation?.content || "[]"}
                onChange={(value) =>
                  updateTranslation(activeTab, "content", value)
                }
              />
            </div>
          </div>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              SEO Settings
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Meta Title */}
            <div className="space-y-2">
              <Label htmlFor="meta-title">Meta Title</Label>
              <Input
                id="meta-title"
                placeholder="Example: Best Pempek in Jakarta"
                value={currentTranslation?.metaTitle || ""}
                onChange={(e) =>
                  updateTranslation(activeTab, "metaTitle", e.target.value)
                }
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Title shown in search engine results. Keep it concise.
                </span>
                <span>
                  {(currentTranslation?.metaTitle || "").length}/60
                </span>
              </div>
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <Label htmlFor="meta-description">Meta Description</Label>
              <Textarea
                id="meta-description"
                rows={4}
                placeholder="Short summary for search engines and social previews..."
                value={currentTranslation?.metaDescription || ""}
                onChange={(e) =>
                  updateTranslation(activeTab, "metaDescription", e.target.value)
                }
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Brief summary displayed on search engines.
                </span>
                <span>
                  {(currentTranslation?.metaDescription || "").length}/160
                </span>
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                placeholder="pempek, kuliner palembang, makanan khas"
                value={currentTranslation?.keywords || ""}
                onChange={(e) =>
                  updateTranslation(activeTab, "keywords", e.target.value)
                }
              />
              <p className="text-xs text-muted-foreground">
                Separate keywords with commas to improve discoverability.
              </p>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-3xl border bg-card p-6 shadow-sm max-h-[calc(100vh-140px)] overflow-y-auto">
            <h3 className="mb-4 font-semibold">Publish</h3>

            <div className="space-y-4">
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    status: value,
                  }))
                }
              >
                <SelectTrigger className="w-full rounded-2xl">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>

              {form.status === "PUBLISHED" && (
                <div className="space-y-2">
                  <Label htmlFor="published-at">Tanggal Publish</Label>
                  <Input
                    id="published-at"
                    type="datetime-local"
                    value={form.publishedAt}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, publishedAt: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Kosongkan untuk publish sekarang. Isi untuk jadwalkan.
                  </p>
                </div>
              )}

<div className="space-y-2">
  <Label htmlFor="reading-time">Reading Time (minutes)</Label>
  <Input
    id="reading-time"
    type="number"
    min={1}
    placeholder="5"
    value={form.readingTime}
    onChange={(e) =>
      setForm((prev) => ({
        ...prev,
        readingTime: Math.max(1, Number(e.target.value)),
      }))
    }
  />
  <p className="text-xs text-muted-foreground">
    Estimated reading duration for this post.
  </p>
</div>

              <div className="flex items-center justify-between">
                <span>Featured</span>
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      isFeatured: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span>Allow Comments</span>
                <Switch
                  checked={form.allowComments}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      allowComments: checked,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Thumbnail
              </label>
              <p className="text-xs text-muted-foreground">
                Pilih 1 gambar utama untuk Blog.
              </p>
              <MediaPicker
                value={form.thumbnailId}
                multiple={false}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    thumbnailId: Array.isArray(value) ? value[0] : value,
                  }))
                }
              />

            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Media (File atau Gambar)
              </label>
              <p className="text-xs text-muted-foreground">
                Tambahkan beberapa gambar, file dll.(opsional)
              </p>
              <MediaPicker
                value={form.featuredMediaIds}
                multiple={true}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    featuredMediaIds: Array.isArray(value) ? value : [value],
                  }))
                }
              />
            </div>
          </div>

<div className="rounded-3xl border bg-card p-6 shadow-sm">
  <div className="mb-4 flex items-center gap-2">
    <Tags className="h-5 w-5" />
    <h3 className="font-semibold">Categories & Tags</h3>
  </div>

  <div className="space-y-6">
    <div>
      <p className="mb-3 text-sm font-medium text-muted-foreground">
        Categories
      </p>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
        {meta.categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between"
          >
            <span className="text-sm font-medium">
              {category.translations?.[0]?.name || "No Name"}
            </span>

            <Switch
              checked={form.categoryIds.includes(category.id)}
              onCheckedChange={(checked) =>
                toggleSelection("categoryIds", category.id, checked)
              }
            />
          </div>
        ))}
      </div>
    </div>

    <div>
      <p className="mb-3 text-sm font-medium text-muted-foreground">
        Tags
      </p>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
        {meta.tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center justify-between"
          >
            <span className="text-sm font-medium">
              {tag.translations?.[0]?.name || "No Name"}
            </span>

            <Switch
              checked={form.tagIds.includes(tag.id)}
              onCheckedChange={(checked) =>
                toggleSelection("tagIds", tag.id, checked)
              }
            />
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
        </div>
      </div>
    </div>
  );
}
