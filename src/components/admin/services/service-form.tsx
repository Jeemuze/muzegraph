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

export default function ServiceForm({
  mode,
}: {
  mode: FormMode;
}) {
  const router = useRouter();
  const params = useParams();
  const serviceId = params?.id as string;

  const [meta, setMeta] = useState<MetaData | null>(null);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [form, setForm] = useState({
    icon: "",
    isActive: true,
    order: 0,
    imageIds: [] as string[],
    translations: [] as Translation[],
  });

  const defaultLanguage = useMemo(() => {
    return meta?.languages?.find((l) => l.isDefault)?.id || "";
  }, [meta]);

  useEffect(() => {
    async function initializeForm() {
      try {
        setInitialized(false);

        const metaRes = await fetch("/api/admin/services/meta");
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
            imageIds: [],
            translations: metaData.languages.map((lang: any) => ({
              languageId: lang.id,
              title: "",
              slug: "",
              description: "[]",
              slugTouched: false,
            })),
          });

          setInitialized(true);
          return;
        }

        if (mode === "edit" && serviceId) {
          const res = await fetch(`/api/admin/services/${serviceId}`);
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.error || "Failed to load service");
            return;
          }

          const mergedTranslations = metaData.languages.map((lang: any) => {
            const existing = data.translations?.find(
              (t: any) => t.languageId === lang.id
            );

            return {
              languageId: lang.id,
              title: existing?.title || "",
              slug: existing?.slug || "",
              description: existing?.description || "[]",
              slugTouched: false,
            };
          });

          setForm({
            icon: data.icon || "",
            isActive:
              data.isActive !== undefined ? data.isActive : true,
            order: data.order || 0,
            imageIds: data.images?.map((img: any) => img.mediaId) || [],
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
  }, [mode, serviceId]);

  function updateTranslation(
    languageId: string,
    field: keyof Translation,
    value: string
  ) {
    setForm((prev) => {
      const updatedTranslations = prev.translations.map((t) => {
        if (t.languageId !== languageId) return t;

        if (field === "title") {
          const autoSlug = generateSlug(value);

          return {
            ...t,
            title: value,
            slug: t.slugTouched ? t.slug : autoSlug,
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

    if (!defaultTranslation?.title.trim()) {
      toast.error("Default service title is required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        icon: form.icon,
        isActive: form.isActive,
        order: form.order,
        imageIds: form.imageIds,
        translations: form.translations.map(
          ({ slugTouched, ...rest }) => rest
        ),
      };

      const endpoint =
        mode === "edit"
          ? `/api/admin/services/${serviceId}`
          : "/api/admin/services";

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
          ? "Service updated successfully"
          : "Service created successfully"
      );

      router.push("/admin/service");
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
      <div className="sticky top-0 z-30 -mx-6 mb-6 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "create"
                ? "Create Service"
                : "Edit Service"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage service structure with multilingual support.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/service")}
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
              {loading ? "Saving..." : "Save Service"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="font-semibold text-foreground">
                Service Translation
              </h2>
              <p className="text-sm text-muted-foreground">
                Fill service details for each language.
              </p>
            </div>

            <div className="mb-6 inline-flex flex-wrap gap-2">
              {meta.languages.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setActiveTab(lang.id)}
                  className={`h-10 rounded-full border px-4 text-xs font-semibold shadow-sm transition-all ${
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
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Service Title
                </label>
                <Input
                  value={currentTranslation?.title || ""}
                  onChange={(e) =>
                    updateTranslation(
                      activeTab,
                      "title",
                      e.target.value
                    )
                  }
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Slug
                </label>
                <Input
                  value={currentTranslation?.slug || ""}
                  onChange={(e) =>
                    updateTranslation(
                      activeTab,
                      "slug",
                      e.target.value
                    )
                  }
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description
                </label>
                <div className="min-h-[350px] overflow-hidden rounded-2xl border">
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
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Settings</h3>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <Input
                  value={form.icon}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      icon: e.target.value,
                    }))
                  }
                  placeholder="monitor / rocket / globe"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Order
                </label>
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
              </div>

              <div className="flex items-center justify-between rounded-2xl border p-4">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">
                    Enable this service publicly.
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

          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Media</h3>

            <MediaPicker
              multiple
              value={form.imageIds}
              onChange={(ids) =>
                setForm((prev) => ({
                  ...prev,
                  imageIds: Array.isArray(ids) ? ids : [ids],
                }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
