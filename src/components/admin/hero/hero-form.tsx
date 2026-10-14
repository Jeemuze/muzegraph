"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/admin/media/media-picker";

type Translation = {
  languageId: string;
  title: string;
  subtitle: string;
  description: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
};

type Language = {
  id: string;
  code: string;
  name: string;
  isDefault?: boolean;
  isActive?: boolean;
};

interface HeroFormProps {
  mode: "create" | "edit";
  heroId?: string;
  initialData?: {
    type?: string;
    imageId?: string;
    imageIds?: string[];
    videoUrl?: string;
    ctaPrimaryUrl?: string;
    ctaSecondaryUrl?: string;
    overlayOpacity?: number;
    isActive?: boolean;
    order?: number;
    translations?: Translation[];
  };
}

export default function HeroForm({ mode, heroId, initialData }: HeroFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [activeTab, setActiveTab] = useState("");
  const [initialized, setInitialized] = useState(false);

  const [form, setForm] = useState({
    type: initialData?.type || "STATIC",
    imageId: initialData?.imageId || "",
    imageIds: initialData?.imageIds || [] as string[],
    videoUrl: initialData?.videoUrl || "",
    ctaPrimaryUrl: initialData?.ctaPrimaryUrl || "",
    ctaSecondaryUrl: initialData?.ctaSecondaryUrl || "",
    overlayOpacity: initialData?.overlayOpacity ?? 40,
    isActive: initialData?.isActive ?? true,
    order: initialData?.order ?? 0,
    translations: [] as Translation[],
  });

  const defaultLanguage = useMemo(() => {
    return languages.find((l) => l.isDefault)?.id || "";
  }, [languages]);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/admin/languages");
        const langs: Language[] = await res.json();
        const activeLangs = langs.filter((l) => l.isActive !== false);
        setLanguages(activeLangs);

        const defaultLang = activeLangs.find((l) => l.isDefault) || activeLangs[0];
        if (defaultLang) setActiveTab(defaultLang.id);

        const translations = activeLangs.map((lang) => {
          const existing = initialData?.translations?.find((t) => t.languageId === lang.id);
          return {
            languageId: lang.id,
            title: existing?.title || "",
            subtitle: existing?.subtitle || "",
            description: existing?.description || "",
            ctaPrimaryText: existing?.ctaPrimaryText || "",
            ctaSecondaryText: existing?.ctaSecondaryText || "",
          };
        });

        setForm((prev) => ({ ...prev, translations }));
        setInitialized(true);
      } catch {
        toast.error("Gagal memuat bahasa");
        setInitialized(true);
      }
    }
    init();
  }, []);

  function updateTranslation(languageId: string, field: keyof Translation, value: string) {
    setForm((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.languageId === languageId ? { ...t, [field]: value } : t
      ),
    }));
  }

  function getTranslation(languageId: string) {
    return form.translations.find((t) => t.languageId === languageId);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const defaultTranslation = form.translations.find((t) => t.languageId === defaultLanguage);
    if (!defaultTranslation?.title.trim()) {
      toast.error("Title wajib diisi (bahasa default)");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        type: form.type,
        imageId: form.type !== "SLIDER" ? (form.imageId || null) : null,
        imageIds: form.type === "SLIDER" ? form.imageIds : [],
        videoUrl: form.videoUrl || null,
        ctaPrimaryUrl: form.ctaPrimaryUrl || null,
        ctaSecondaryUrl: form.ctaSecondaryUrl || null,
        overlayOpacity: form.overlayOpacity,
        isActive: form.isActive,
        order: form.order,
        translations: form.translations
          .filter((t) => t.title.trim())
          .map((t) => ({
            languageId: t.languageId,
            title: t.title.trim(),
            subtitle: t.subtitle.trim() || null,
            description: t.description.trim() || null,
            ctaPrimaryText: t.ctaPrimaryText.trim() || null,
            ctaSecondaryText: t.ctaSecondaryText.trim() || null,
          })),
      };

      const endpoint = mode === "create" ? "/api/admin/hero" : `/api/admin/hero/${heroId}`;
      const res = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal menyimpan hero");

      toast.success(mode === "create" ? "Hero berhasil dibuat" : "Hero berhasil diperbarui");
      router.push("/admin/hero");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!initialized) {
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
            <h1 className="text-xl font-semibold">{mode === "create" ? "Tambah Hero" : "Edit Hero"}</h1>
            <p className="text-sm text-muted-foreground">Kelola konten hero section</p>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/hero")} className="rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={loading} className="rounded-xl">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {loading ? "Menyimpan..." : "Simpan Hero"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Left: Content with language tabs */}
        <div className="space-y-6">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="mb-6 inline-flex flex-wrap gap-2">
              {languages.map((lang) => (
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

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Title *</label>
                <Input
                  value={currentTranslation?.title || ""}
                  onChange={(e) => updateTranslation(activeTab, "title", e.target.value)}
                  placeholder="Welcome to Our Company"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Subtitle</label>
                <Input
                  value={currentTranslation?.subtitle || ""}
                  onChange={(e) => updateTranslation(activeTab, "subtitle", e.target.value)}
                  placeholder="We build amazing things"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <Textarea
                  value={currentTranslation?.description || ""}
                  onChange={(e) => updateTranslation(activeTab, "description", e.target.value)}
                  placeholder="Brief description..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Primary Button Text</label>
                  <Input
                    value={currentTranslation?.ctaPrimaryText || ""}
                    onChange={(e) => updateTranslation(activeTab, "ctaPrimaryText", e.target.value)}
                    placeholder="Hubungi Kami"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Secondary Button Text</label>
                  <Input
                    value={currentTranslation?.ctaSecondaryText || ""}
                    onChange={(e) => updateTranslation(activeTab, "ctaSecondaryText", e.target.value)}
                    placeholder="Lihat Portfolio"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Settings */}
        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-3xl border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-semibold">Settings</h3>

            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="STATIC">Static Image</option>
                <option value="SLIDER">Slider</option>
                <option value="VIDEO">Video Background</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Overlay Opacity ({form.overlayOpacity}%)</label>
              <input
                type="range"
                min={0}
                max={100}
                value={form.overlayOpacity}
                onChange={(e) => setForm((prev) => ({ ...prev, overlayOpacity: Number(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Order</label>
                <Input
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(e) => setForm((prev) => ({ ...prev, order: Number(e.target.value) }))}
                />
              </div>
            </div>

            {form.type === "VIDEO" && (
              <div>
                <label className="mb-1 block text-sm font-medium">Video URL</label>
                <Input
                  value={form.videoUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://youtube.com/..."
                />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Primary Button URL</label>
                <Input
                  value={form.ctaPrimaryUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, ctaPrimaryUrl: e.target.value }))}
                  placeholder="/contact"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Secondary Button URL</label>
                <Input
                  value={form.ctaSecondaryUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, ctaSecondaryUrl: e.target.value }))}
                  placeholder="/portfolio"
                />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              <span className="text-sm">Active</span>
            </label>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">
              {form.type === "SLIDER" ? "Images (Slider)" : "Image"}
            </h3>
            {form.type === "SLIDER" ? (
              <MediaPicker
                multiple={true}
                value={form.imageIds}
                onChange={(ids) =>
                  setForm((prev) => ({
                    ...prev,
                    imageIds: Array.isArray(ids) ? ids : [ids],
                  }))
                }
              />
            ) : (
              <MediaPicker
                multiple={false}
                value={form.imageId ? [form.imageId] : []}
                onChange={(ids) =>
                  setForm((prev) => ({
                    ...prev,
                    imageId: typeof ids === "string" ? ids : ids[0] || "",
                  }))
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
