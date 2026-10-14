"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TiptapEditor } from "@/components/editor/tiptap-dynamic";

type FormMode = "create" | "edit";

type Translation = {
  languageId: string;
  question: string;
  answer: string;
};

type MetaData = {
  languages: {
    id: string;
    code: string;
    name: string;
    isDefault?: boolean;
  }[];
  categories?: {
    id: string;
    translations?: {
      name: string;
    }[];
  }[];
};

function normalizeEditorValue(value?: string | null) {
  if (!value || !String(value).trim()) {
    return JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return value;
    }
  } catch {}

  return JSON.stringify({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: String(value) }] }],
  });
}

function cleanEditorValue(value?: string | null) {
  if (!value) {
    return JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return JSON.stringify(parsed);
    }
  } catch {}

  return normalizeEditorValue(value);
}

export default function FaqForm({
  mode,
}: {
  mode: FormMode;
}) {
  const router = useRouter();
  const params = useParams();
  const faqId = params?.id as string;

  const [meta, setMeta] = useState<MetaData | null>(null);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [form, setForm] = useState({
    categoryId: "",
    isFeatured: false,
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

        const metaRes = await fetch("/api/admin/faqs/meta");
        const metaData = await metaRes.json();

        if (!metaRes.ok) {
          toast.error(metaData.error || "Failed to load metadata");
          setInitialized(true);
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
            categoryId: "",
            isFeatured: false,
            isActive: true,
            order: 0,
            translations: metaData.languages.map((lang: any) => ({
              languageId: lang.id,
              question: "",
              answer: normalizeEditorValue(""),
            })),
          });

          setInitialized(true);
          return;
        }

        if (mode === "edit" && faqId) {
          const res = await fetch(`/api/admin/faqs/${faqId}`);
          const response = await res.json();

          if (!res.ok) {
            toast.error(response.error || "Failed to load FAQ");
            setInitialized(true);
            return;
          }

          const data = response.data || response;

          const mergedTranslations = metaData.languages.map((lang: any) => {
            const existing = data.translations?.find(
              (t: any) => t.languageId === lang.id
            );

            return {
              languageId: lang.id,
              question: existing?.question || "",
              answer: normalizeEditorValue(existing?.answer),
            };
          });

          setForm({
            categoryId: data.categoryId || "",
            isFeatured: data.isFeatured ?? false,
            isActive: data.isActive ?? true,
            order: data.order || 0,
            translations: mergedTranslations,
          });

          setInitialized(true);
          return;
        }

        setInitialized(true);
      } catch {
        toast.error("Initialization failed");
        setInitialized(true);
      }
    }

    initializeForm();
  }, [mode, faqId]);

  function updateTranslation(
    languageId: string,
    field: keyof Translation,
    value: string
  ) {
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

  async function handleSubmit() {
    const defaultTranslation = form.translations.find(
      (t) => t.languageId === defaultLanguage
    );

    if (!defaultTranslation?.question.trim()) {
      toast.error("Default FAQ question is required");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "edit"
          ? `/api/admin/faqs/${faqId}`
          : "/api/admin/faqs";

      const method = mode === "edit" ? "PUT" : "POST";

      const payload = {
        ...form,
        translations: form.translations.map((t) => ({
          ...t,
          answer: cleanEditorValue(t.answer),
        })),
      };

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
          ? "FAQ updated successfully"
          : "FAQ created successfully"
      );

      router.push("/admin/faqs");
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
    activeTab && form.translations.length > 0
      ? getTranslation(activeTab)
      : null;

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-30 -mx-6 mb-6 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "create" ? "Create FAQ" : "Edit FAQ"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage FAQ with multilingual support.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/faqs")}
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
              {loading ? "Saving..." : "Save FAQ"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="font-semibold text-foreground">
                FAQ Translation
              </h2>
              <p className="text-sm text-muted-foreground">
                Fill FAQ content for each language.
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

            {currentTranslation && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Question
                  </label>
                  <Input
                    value={currentTranslation.question}
                    onChange={(e) =>
                      updateTranslation(
                        activeTab,
                        "question",
                        e.target.value
                      )
                    }
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Answer
                  </label>

                  <div className="min-h-[350px] overflow-hidden rounded-2xl border">
                    <TiptapEditor
                      key={activeTab}
                      value={normalizeEditorValue(currentTranslation.answer)}
                      onChange={(value) =>
                        updateTranslation(
                          activeTab,
                          "answer",
                          value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Settings</h3>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Category
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border bg-background px-4 py-3 text-sm"
                >
                  <option value="">No Category</option>
                  {meta.categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.translations?.[0]?.name || "-"}
                    </option>
                  ))}
                </select>
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
                <p className="text-sm font-medium">Featured</p>
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

              <div className="flex items-center justify-between rounded-2xl border p-4">
                <p className="text-sm font-medium">Active</p>
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
