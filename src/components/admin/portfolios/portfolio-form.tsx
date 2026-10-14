"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { MediaPicker } from "@/components/admin/media/media-picker";
import { TiptapEditor } from "@/components/editor/tiptap-dynamic";

import { generateSlug } from "@/lib/utils/slug";

type FormMode = "create" | "edit";

type Translation = {
  languageId: string;
  title: string;
  excerpt: string;
  description: string;
  result: string;
};

type MetaData = {
  languages: {
    id: string;
    code: string;
    name: string;
    isDefault?: boolean;
  }[];
  tags: {
    id: string;
    slug: string;
    translations?: {
      name: string;
    }[];
  }[];
};

export default function PortfolioForm({
  mode,
}: {
  mode: FormMode;
}) {
  const router = useRouter();
  const params = useParams();
  const portfolioId = params?.id as string;

  const [meta, setMeta] = useState<MetaData | null>(null);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

const [form, setForm] = useState({
  slug: "",
  slugTouched: false,
  clientName: "",
  industry: "",
  location: "",
  completedAt: "",
  isFeatured: false,
  isActive: true,
  order: 0,
  coverImageId: "",
  galleryIds: [] as string[],
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

        const metaRes = await fetch("/api/admin/portfolios/meta");
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
            slug: "",
            slugTouched: false,
            clientName: "",
            industry: "",
            location: "",
            completedAt: "",
            isFeatured: false,
            isActive: true,
            order: 0,
            coverImageId: "",
            galleryIds: [],
            tagIds: [],
            translations: metaData.languages.map((lang: any) => ({
              languageId: lang.id,
              title: "",
              excerpt: "",
              description: "[]",
              result: "",
            })),
          });

          setInitialized(true);
          return;
        }

if (mode === "edit" && portfolioId) {
  const res = await fetch(`/api/admin/portfolios/${portfolioId}`);
  const response = await res.json();

  if (!res.ok) {
    toast.error(response.error || "Failed to load portfolio");
    return;
  }

  const data = response.data || response;

  const mergedTranslations = metaData.languages.map((lang: any) => {
    const existing = data.translations?.find(
      (t: any) => t.languageId === lang.id
    );

    return {
      languageId: lang.id,
      title: existing?.title || "",
      excerpt: existing?.excerpt || "",
      description: existing?.description || "[]",
      result: existing?.result || "",
    };
  });

  setForm({
    slug: data.slug || "",
    slugTouched: true,
    clientName: data.clientName || "",
    industry: data.industry || "",
    location: data.location || "",
    completedAt: data.completedAt
      ? new Date(data.completedAt).toISOString().split("T")[0]
      : "",
    isFeatured: data.isFeatured || false,
    isActive:
      data.isActive !== undefined ? data.isActive : true,
    order: data.order || 0,
    coverImageId: data.coverImageId || "",
    galleryIds:
      data.galleries?.map((g: any) => g.mediaId) || [],
    tagIds:
      data.tags?.map((t: any) => t.tagId) || [],
    translations: mergedTranslations,
  });
}

        setInitialized(true);
      } catch {
        toast.error("Initialization failed");
        setInitialized(true);
      }
    }

    initializeForm();
  }, [mode, portfolioId]);

  function updateTranslation(
    languageId: string,
    field: keyof Translation,
    value: string
  ) {
    setForm((prev) => {
      const updatedTranslations = prev.translations.map((t) =>
        t.languageId === languageId
          ? { ...t, [field]: value }
          : t
      );

      const isDefaultLang = languageId === defaultLanguage;

      return {
        ...prev,
        slug:
          field === "title" &&
          isDefaultLang &&
          !prev.slugTouched
            ? generateSlug(value)
            : prev.slug,
        translations: updatedTranslations,
      };
    });
  }

  function getTranslation(languageId: string) {
    return form.translations.find(
      (t) => t.languageId === languageId
    );
  }

  async function handleSubmit() {
    const defaultTranslation = form.translations.find(
      (t) => t.languageId === defaultLanguage
    );

    if (!defaultTranslation?.title.trim()) {
      toast.error("Default portfolio title is required");
      return;
    }

    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setLoading(true);

    try {
      const { slugTouched, ...cleanForm } = form;

      const payload = {
        ...cleanForm,
      };

      const endpoint =
        mode === "edit"
          ? `/api/admin/portfolios/${portfolioId}`
          : "/api/admin/portfolios";

      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Save failed");
        return;
      }

      toast.success(
        mode === "edit"
          ? "Portfolio updated successfully"
          : "Portfolio created successfully"
      );

      router.push("/admin/portfolios");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!initialized || !meta) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const currentTranslation = getTranslation(activeTab);

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-30 -mx-6 mb-6 bg-background/95 px-6 py-4 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">
              {mode === "create"
                ? "Create Portfolio"
                : "Edit Portfolio"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage portfolio with multilingual support.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/portfolios")}
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
              {loading ? "Saving..." : "Save Portfolio"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="mb-6 inline-flex flex-wrap gap-2">
              {meta.languages.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setActiveTab(lang.id)}
                  className={`h-10 rounded-full border px-4 text-xs font-semibold ${
                    activeTab === lang.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {lang.code.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="space-y-5">
              <Input
                placeholder="Portfolio Title"
                value={currentTranslation?.title || ""}
                onChange={(e) =>
                  updateTranslation(
                    activeTab,
                    "title",
                    e.target.value
                  )
                }
              />
            <Input
              placeholder="Slug"
              value={form.slug}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  slug: generateSlug(e.target.value),
                  slugTouched: true,
                }))
              }
            />

              <Input
                placeholder="Excerpt"
                value={currentTranslation?.excerpt || ""}
                onChange={(e) =>
                  updateTranslation(
                    activeTab,
                    "excerpt",
                    e.target.value
                  )
                }
              />

              <div className="min-h-[300px] overflow-hidden rounded-2xl border">
                <TiptapEditor
                  key={activeTab}
                  value={currentTranslation?.description || "[]"}
                  onChange={(value) =>
                    updateTranslation(
                      activeTab,
                      "description",
                      value
                    )
                  }
                />
              </div>

              <Input
                placeholder="Result"
                value={currentTranslation?.result || ""}
                onChange={(e) =>
                  updateTranslation(
                    activeTab,
                    "result",
                    e.target.value
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-3xl border bg-card p-6 shadow-sm space-y-4">


            <Input
              placeholder="Client Name"
              value={form.clientName}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  clientName: e.target.value,
                }))
              }
            />

            <Input
              placeholder="Industry"
              value={form.industry}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  industry: e.target.value,
                }))
              }
            />

            <Input
              placeholder="Location"
              value={form.location}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
            />

            <Input
              type="date"
              value={form.completedAt}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  completedAt: e.target.value,
                }))
              }
            />

<div className="flex items-center justify-between gap-4">
  <div>
    <p className="text-sm font-medium">Order</p>
  </div>

  <div className="w-24">
    <Input
      type="number"
      min={0}
      value={form.order}
      onChange={(e) =>
        setForm((prev) => ({
          ...prev,
          order: Number(e.target.value),
        }))
      }
      placeholder="0"
      className="text-center"
    />
  </div>
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
              <span>Active</span>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({
                    ...prev,
                    isActive: checked,
                  }))
                }
              />
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Cover Image</h3>
            <MediaPicker
              value={form.coverImageId ? [form.coverImageId] : []}
              onChange={(ids) =>
                setForm((prev) => ({
                  ...prev,
                  coverImageId: ids[0] || "",
                }))
              }
            />
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Gallery</h3>
            <MediaPicker
              multiple
              value={form.galleryIds}
              onChange={(ids) =>
                setForm((prev) => ({
                  ...prev,
                  galleryIds: Array.isArray(ids) ? ids : [ids],
                }))
              }
            />
          </div>


          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Tags</h3>

            <div className="flex flex-wrap gap-2">
              {meta.tags?.length ? (
                meta.tags.map((tag) => {
                  const selected = form.tagIds.includes(tag.id);

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          tagIds: selected
                            ? prev.tagIds.filter((id) => id !== tag.id)
                            : [...prev.tagIds, tag.id],
                        }))
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {tag.translations?.[0]?.name || tag.slug}
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tags available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
