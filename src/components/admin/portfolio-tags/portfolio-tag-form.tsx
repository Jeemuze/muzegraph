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
};

type MetaData = {
  languages: {
    id: string;
    code: string;
    name: string;
    isDefault?: boolean;
  }[];
};

export default function PortfolioTagForm({
  mode,
}: {
  mode: FormMode;
}) {
  const router = useRouter();
  const params = useParams();
  const tagId = params?.id as string;

  const [meta, setMeta] = useState<MetaData | null>(null);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [form, setForm] = useState({
    slug: "",
    slugTouched: false,
    isActive: true,
    translations: [] as Translation[],
  });

  const defaultLanguage = useMemo(() => {
    return meta?.languages?.find((l) => l.isDefault)?.id || "";
  }, [meta]);

  useEffect(() => {
    async function initializeForm() {
      try {
        setInitialized(false);

        const metaRes = await fetch(
          "/api/admin/portfolio-tags/meta"
        );
        const metaData = await metaRes.json();

        if (!metaRes.ok) {
          toast.error(
            metaData.message || "Failed to load metadata"
          );
          return;
        }

        const finalMeta = metaData.data || metaData;

        setMeta(finalMeta);

        const defaultLang =
          finalMeta.languages.find(
            (l: any) => l.isDefault
          ) || finalMeta.languages[0];

        if (defaultLang) {
          setActiveTab(defaultLang.id);
        }

        if (mode === "create") {
          setForm({
            slug: "",
            slugTouched: false,
            isActive: true,
            translations: finalMeta.languages.map(
              (lang: any) => ({
                languageId: lang.id,
                name: "",
              })
            ),
          });

          setInitialized(true);
          return;
        }

        if (mode === "edit" && tagId) {
          const res = await fetch(
            `/api/admin/portfolio-tags/${tagId}`
          );

          const response = await res.json();

          if (!res.ok) {
            toast.error(
              response.message || "Failed to load tag"
            );
            return;
          }

          const data = response.data;

          const mergedTranslations =
            finalMeta.languages.map((lang: any) => {
              const existing =
                data.translations?.find(
                  (t: any) =>
                    t.languageId === lang.id
                );

              return {
                languageId: lang.id,
                name: existing?.name || "",
              };
            });

          setForm({
            slug: data.slug || "",
            slugTouched: true,
            isActive:
              data.isActive !== undefined
                ? data.isActive
                : true,
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
  }, [mode, tagId]);

  function updateTranslation(
    languageId: string,
    value: string
  ) {
    setForm((prev) => {
      const updatedTranslations =
        prev.translations.map((t) =>
          t.languageId === languageId
            ? { ...t, name: value }
            : t
        );

      const isDefaultLang =
        languageId === defaultLanguage;

      return {
        ...prev,
        slug:
          isDefaultLang && !prev.slugTouched
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
    const defaultTranslation =
      form.translations.find(
        (t) => t.languageId === defaultLanguage
      );

    if (!defaultTranslation?.name.trim()) {
      toast.error("Default tag name is required");
      return;
    }

    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setLoading(true);

    try {
      const { slugTouched, ...cleanForm } = form;

      const endpoint =
        mode === "edit"
          ? `/api/admin/portfolio-tags/${tagId}`
          : "/api/admin/portfolio-tags";

      const method =
        mode === "edit" ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanForm),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.message || "Save failed"
        );
        return;
      }

      toast.success(
        mode === "edit"
          ? "Tag updated successfully"
          : "Tag created successfully"
      );

      router.push("/admin/portfolio-tags");
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

  const currentTranslation =
    getTranslation(activeTab);

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-30 -mx-6 mb-6 bg-background/95 px-6 py-4 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">
              {mode === "create"
                ? "Create Portfolio Tag"
                : "Edit Portfolio Tag"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push("/admin/portfolio-tags")
              }
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
              {loading ? "Saving..." : "Save Tag"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">


          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">
              Translations
            </h3>

            <div className="mb-6 inline-flex flex-wrap gap-2">
              {meta.languages.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(lang.id)
                  }
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

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tag Name
              </label>
              <Input
                placeholder="Enter tag name"
                value={
                  currentTranslation?.name || ""
                }
                onChange={(e) =>
                  updateTranslation(
                    activeTab,
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-sm">

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Slug
              </label>
              <Input
                placeholder="portfolio-tag-slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    slug: generateSlug(
                      e.target.value
                    ),
                    slugTouched: true,
                  }))
                }
              />
            </div>
          </div>


        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm space-y-4 h-fit">
          <h3 className="text-sm font-semibold">
            Settings
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-sm">
              Active
            </span>
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
  );
}
