"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Save,
  Globe,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FormMode = "create" | "edit";

type Translation = {
  languageId: string;
  name: string;
  description: string;
};

type MetaData = {
  languages: {
    id: string;
    code: string;
    name: string;
    isDefault?: boolean;
  }[];
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function FaqCategoryForm({
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
    slug: "",
    isActive: true,
    order: 0,
    slugTouched: false,
    translations: [] as Translation[],
  });

  const defaultLanguage = useMemo(() => {
    return meta?.languages?.find((l) => l.isDefault)?.id || "";
  }, [meta]);

  useEffect(() => {
    async function initializeForm() {
      try {
        setInitialized(false);

        const metaRes = await fetch("/api/admin/faq-categories/meta");
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
            isActive: true,
            order: 0,
            slugTouched: false,
            translations: metaData.languages.map((lang: any) => ({
              languageId: lang.id,
              name: "",
              description: "",
            })),
          });

          setInitialized(true);
          return;
        }

        const res = await fetch(`/api/admin/faq-categories/${categoryId}`);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Failed to load category");
          return;
        }

        const defaultTranslation = data.translations.find(
          (t: any) => t.languageId === defaultLang.id
        );

        setForm({
          slug: data.slug || "",
          isActive: data.isActive ?? true,
          order: data.order ?? 0,
          slugTouched:
            !!data.slug &&
            data.slug !== slugify(defaultTranslation?.name || ""),
          translations: metaData.languages.map((lang: any) => {
            const existing = data.translations.find(
              (t: any) => t.languageId === lang.id
            );

            return {
              languageId: lang.id,
              name: existing?.name || "",
              description: existing?.description || "",
            };
          }),
        });

        setInitialized(true);
      } catch {
        toast.error("Initialization failed");
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
      const updatedTranslations = prev.translations.map((t) =>
        t.languageId === languageId ? { ...t, [field]: value } : t
      );

      const shouldUpdateSlug =
        field === "name" &&
        languageId === defaultLanguage &&
        !prev.slugTouched;

      return {
        ...prev,
        translations: updatedTranslations,
        slug: shouldUpdateSlug ? slugify(value) : prev.slug,
      };
    });
  }

  function getTranslation(languageId: string) {
    return form.translations.find((t) => t.languageId === languageId);
  }

  async function handleSubmit() {
    const defaultTranslation = form.translations.find(
      (t) => t.languageId === defaultLanguage
    );

    if (!defaultTranslation?.name.trim()) {
      toast.error("Default category name is required");
      return;
    }

    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "edit"
          ? `/api/admin/faq-categories/${categoryId}`
          : "/api/admin/faq-categories";

      const method = mode === "edit" ? "PUT" : "POST";

      const payload = {
        slug: form.slug,
        isActive: form.isActive,
        order: form.order,
        translations: form.translations,
      };

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Save failed");
        return;
      }

      toast.success(
        mode === "edit"
          ? "Category updated successfully"
          : "Category created successfully"
      );

      router.push("/admin/faq-categories");
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
      <div className="sticky top-0 z-30 -mx-6 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {mode === "create"
                ? "Create FAQ Category"
                : "Edit FAQ Category"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage FAQ categories with multilingual support.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/faq-categories")}
              className="rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-xl"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Main */}
        <div className="space-y-6">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <h2 className="font-semibold">Translations</h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 inline-flex h-auto flex-wrap gap-2 bg-transparent p-0">
                {meta.languages.map((lang) => (
                  <TabsTrigger
                    key={lang.id}
                    value={lang.id}
                    className="h-10 rounded-full border px-4 text-xs font-semibold"
                  >
                    {lang.code.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {currentTranslation && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Category Name</Label>
                  <Input
                    placeholder="Enter category name"
                    value={currentTranslation.name}
                    onChange={(e) =>
                      updateTranslation(activeTab, "name", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={4}
                    placeholder="Category description..."
                    value={currentTranslation.description}
                    onChange={(e) =>
                      updateTranslation(
                        activeTab,
                        "description",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <h3 className="font-semibold">Settings</h3>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  placeholder="faq-category"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      slug: slugify(e.target.value),
                      slugTouched: true,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      order: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Active</span>
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
