"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { generateSlug } from "@/lib/utils/slug";

type FormMode = "create" | "edit";

type Translation = {
  languageId: string;
  name: string;
  slug: string;
  description: string;
  slugTouched?: boolean;
};

type MetaData = {
  languages: {
    id: string;
    code: string;
    name: string;
    isDefault?: boolean;
  }[];
};

export default function PostCategoryForm({
  mode,
}: {
  mode: FormMode;
}) {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id as string;

  const [meta, setMeta] = useState<MetaData | null>(null);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [form, setForm] = useState({
    icon: "",
    isActive: true,
    order: 0,
    translations: [] as Translation[],
  });

  const defaultLanguage = useMemo(() => {
    return meta?.languages?.find((l) => l.isDefault)?.id || "";
  }, [meta]);

  useEffect(() => {
    async function initializeForm() {
      try {
        setInitialized(false);

        const metaRes = await fetch("/api/admin/post-categories/meta");
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
            icon: "",
            isActive: true,
            order: 0,
            translations: metaData.languages.map((lang: any) => ({
              languageId: lang.id,
              name: "",
              slug: "",
              description: "",
              slugTouched: false,
            })),
          });

          setInitialized(true);
          return;
        }

        if (mode === "edit" && categoryId) {
          const res = await fetch(
            `/api/admin/post-categories/${categoryId}`
          );

          const data = await res.json();

          if (!res.ok) {
            toast.error(data.error || "Failed to load category");
            return;
          }

          const mergedTranslations = metaData.languages.map((lang: any) => {
            const existing = data.translations?.find(
              (t: any) => t.languageId === lang.id
            );

            return {
              languageId: lang.id,
              name: existing?.name || "",
              slug: existing?.slug || "",
              description: existing?.description || "",
              slugTouched: false,
            };
          });

          setForm({
            icon: data.icon || "",
            isActive:
              data.isActive !== undefined ? data.isActive : true,
            order: data.order || 0,
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
  }, [mode, categoryId]);

function updateTranslation(
  languageId: string,
  field: keyof Translation,
  value: string
) {
  setForm((prev) => {
    const exists = prev.translations.some(
      (t) => t.languageId === languageId
    );

    let updatedTranslations = [...prev.translations];

    if (!exists) {
      updatedTranslations.push({
        languageId,
        name: "",
        slug: "",
        description: "",
        slugTouched: false,
      });
    }

    updatedTranslations = updatedTranslations.map((t) => {
      if (t.languageId !== languageId) return t;

      if (field === "name") {
        const shouldAutoUpdate =
          !t.slugTouched || t.slug === generateSlug(t.name);

        return {
          ...t,
          name: value,
          slug: shouldAutoUpdate ? generateSlug(value) : t.slug,
        };
      }

      if (field === "slug") {
        return {
          ...t,
          slug: generateSlug(value),
          slugTouched: true,
        };
      }

      return {
        ...t,
        [field]: value,
      };
    });

    return {
      ...prev,
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

      if (!defaultTranslation?.name.trim()) {
        toast.error("Default category name is required");
        return;
      }

      const hasInvalidTranslation = form.translations.some(
  (t) => t.name.trim() && !generateSlug(t.slug || t.name)
);

if (hasInvalidTranslation) {
  toast.error("Some translations have invalid slug");
  return;
}

setLoading(true);

      try {
        const payload = {
          icon: form.icon,
          isActive: form.isActive,
          order: form.order,
          translations: form.translations
            .filter(
              (t) =>
                t.name.trim() ||
                t.slug.trim() ||
                t.description.trim()
            )
            .map(({ slugTouched, ...rest }) => ({
              ...rest,
              slug: rest.slug.trim()
                ? rest.slug
                : generateSlug(rest.name),
            })),
        };

        const endpoint =
          mode === "edit"
            ? `/api/admin/post-categories/${categoryId}`
            : "/api/admin/post-categories";

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
    ? "Category updated successfully"
    : "Category created successfully"
);
        router.push("/admin/post-categories");
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
    {/* Header */}
    <div className="sticky top-0 z-30 -mx-6 mb-6 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {mode === "create"
              ? "Create Post Category"
              : "Edit Post Category"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage category structure with multilingual support.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/post-categories")}
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
            {loading ? "Saving..." : "Save Category"}
          </Button>
        </div>
      </div>
    </div>

    {/* Layout */}
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      {/* Main Content */}
      <div className="space-y-6">
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-semibold text-foreground">
              Category Translation
            </h2>
            <p className="text-sm text-muted-foreground">
              Fill category details for each language.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 inline-flex flex-wrap gap-2">
            {meta.languages.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setActiveTab(lang.id)}
                className={`
                  h-10 rounded-full border px-4 text-xs font-semibold shadow-sm transition-all
                  ${
                    activeTab === lang.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }
                `}
              >
                {lang.code.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Inputs */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Name</label>
              <Input
                placeholder="Enter category name"
                value={currentTranslation?.name || ""}
                onChange={(e) =>
                  updateTranslation(activeTab, "name", e.target.value)
                }
                className="rounded-2xl"
              />
              <p className="text-xs text-muted-foreground">
                The visible name of this category.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input
                placeholder="category-slug"
                value={currentTranslation?.slug || ""}
                onChange={(e) =>
                  updateTranslation(activeTab, "slug", e.target.value)
                }
                className="rounded-2xl"
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier for this category.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                placeholder="Write category description..."
                value={currentTranslation?.description || ""}
                onChange={(e) =>
                  updateTranslation(
                    activeTab,
                    "description",
                    e.target.value
                  )
                }
                className="min-h-[140px] w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                Optional short explanation about this category.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Settings</h3>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon</label>
              <Input
                placeholder="e.g. layout-grid"
                value={form.icon}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    icon: e.target.value,
                  }))
                }
                className="rounded-2xl"
              />
              <p className="text-xs text-muted-foreground">
                Find icon names on{" "}
                <a
                  href="https://lucide.dev/icons/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary"
                >
                  Lucide Icons
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Order</label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    order: Number(e.target.value),
                  }))
                }
                className="rounded-2xl"
              />
              <p className="text-xs text-muted-foreground">
                Determines display priority.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-2xl border p-4">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Enable this category publicly.
                </p>
              </div>

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
        </div>
      </div>
    </div>
  </div>
);

  }
