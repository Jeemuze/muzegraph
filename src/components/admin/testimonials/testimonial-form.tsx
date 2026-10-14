"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Save,
  Star,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MediaPicker } from "@/components/admin/media/media-picker";

type FormMode = "create" | "edit";

type Translation = {
  languageId: string;
  content: string;
};

type MetaData = {
  languages: {
    id: string;
    code: string;
    name: string;
    isDefault?: boolean;
  }[];
};

type TestimonialFormState = {
  clientName: string;
  clientRole: string;
  companyName: string;
  companyUrl: string;
  projectName: string;
  rating: number;
  avatarId: string;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  translations: Translation[];
};

const INITIAL_FORM: TestimonialFormState = {
  clientName: "",
  clientRole: "",
  companyName: "",
  companyUrl: "",
  projectName: "",
  rating: 5,
  avatarId: "",
  isFeatured: false,
  isActive: true,
  order: 0,
  translations: [],
};

export default function TestimonialForm({
  mode,
}: {
  mode: FormMode;
}) {
  const router = useRouter();
  const params = useParams();
  const testimonialId = params?.id as string;

  const [meta, setMeta] = useState<MetaData | null>(null);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [form, setForm] = useState<TestimonialFormState>(INITIAL_FORM);

  const defaultLanguage = useMemo(() => {
    return meta?.languages?.find((l) => l.isDefault)?.id || "";
  }, [meta]);

  useEffect(() => {
    async function initializeForm() {
      try {
        setInitialized(false);

        const metaRes = await fetch("/api/admin/testimonials/meta");
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
            ...INITIAL_FORM,
            translations: metaData.languages.map((lang: any) => ({
              languageId: lang.id,
              content: "",
            })),
          });

          setInitialized(true);
          return;
        }

        if (mode === "edit" && testimonialId) {
          const res = await fetch(`/api/admin/testimonials/${testimonialId}`);
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.error || "Failed to load testimonial");
            setInitialized(true);
            return;
          }

          const mergedTranslations = metaData.languages.map((lang: any) => {
            const existing = data.translations?.find(
              (t: any) => t.languageId === lang.id
            );

            return {
              languageId: lang.id,
              content: existing?.content || "",
            };
          });

          setForm({
            clientName: data.clientName || "",
            clientRole: data.clientRole || "",
            companyName: data.companyName || "",
            companyUrl: data.companyUrl || "",
            projectName: data.projectName || "",
            rating: data.rating || 5,
            avatarId: data.avatarId || "",
            isFeatured: Boolean(data.isFeatured),
            isActive: data.isActive ?? true,
            order: data.order || 0,
            translations: mergedTranslations,
          });
        }

        setInitialized(true);
      } catch (error) {
        console.error(error);
        toast.error("Initialization failed");
        setInitialized(true);
      }
    }

    initializeForm();
  }, [mode, testimonialId]);

  function updateField<K extends keyof TestimonialFormState>(
    key: K,
    value: TestimonialFormState[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updateTranslation(languageId: string, value: string) {
    setForm((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.languageId === languageId ? { ...t, content: value } : t
      ),
    }));
  }

  function getTranslation(languageId: string) {
    return form.translations.find((t) => t.languageId === languageId);
  }

  async function handleSubmit() {
    if (!form.clientName.trim()) {
      toast.error("Client name is required");
      return;
    }

    const defaultTranslation = form.translations.find(
      (t) => t.languageId === defaultLanguage
    );

    if (!defaultTranslation?.content.trim()) {
      toast.error("Default testimonial content is required");
      return;
    }

    if (form.rating < 1 || form.rating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        clientName: form.clientName.trim(),
        clientRole: form.clientRole.trim(),
        companyName: form.companyName.trim(),
        companyUrl: form.companyUrl.trim(),
        projectName: form.projectName.trim(),
        avatarId: form.avatarId || null,
        translations: form.translations.filter((t) => t.content.trim()),
      };

      const endpoint =
        mode === "edit"
          ? `/api/admin/testimonials/${testimonialId}`
          : "/api/admin/testimonials";

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
          ? "Testimonial updated successfully"
          : "Testimonial created successfully"
      );

      router.push("/admin/testimonials");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
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
      {/* HEADER */}
      <div className="sticky top-0 z-30 -mx-6 bg-background/95 px-6 py-4 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold">
            {mode === "create" ? "Create Testimonial" : "Edit Testimonial"}
          </h1>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/testimonials")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* LEFT */}
        <div className="space-y-6">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h2 className="mb-5 font-semibold">Client Information</h2>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                placeholder="Client Name"
                value={form.clientName}
                onChange={(e) => updateField("clientName", e.target.value)}
              />

              <Input
                placeholder="Client Role"
                value={form.clientRole}
                onChange={(e) => updateField("clientRole", e.target.value)}
              />

              <Input
                placeholder="Company Name"
                value={form.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
              />

              <Input
                placeholder="Company URL"
                value={form.companyUrl}
                onChange={(e) => updateField("companyUrl", e.target.value)}
              />

              <Input
                placeholder="Project Name"
                value={form.projectName}
                onChange={(e) => updateField("projectName", e.target.value)}
              />
            </div>
          </div>

          {/* AVATAR MEDIA PICKER */}
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              <h2 className="font-semibold">Avatar</h2>
            </div>

            <MediaPicker
              value={form.avatarId}
              multiple={false}
              onChange={(value) =>
                updateField(
                  "avatarId",
                  Array.isArray(value) ? value[0] : value
                )
              }
            />
          </div>

          {/* TRANSLATIONS */}
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h2 className="mb-5 font-semibold">Testimonial Content</h2>

            <div className="mb-6 flex flex-wrap gap-2">
              {meta.languages.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setActiveTab(lang.id)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                    activeTab === lang.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-background"
                  }`}
                >
                  {lang.code.toUpperCase()}
                </button>
              ))}
            </div>

            <Textarea
              rows={8}
              placeholder="Write testimonial..."
              value={currentTranslation?.content || ""}
              onChange={(e) =>
                updateTranslation(activeTab, e.target.value)
              }
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Settings</h3>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Rating</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) =>
                    updateField("rating", Number(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(e) =>
                    updateField("order", Number(e.target.value))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span>Featured</span>
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={(checked) =>
                    updateField("isFeatured", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span>Active</span>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    updateField("isActive", checked)
                  }
                />
              </div>

              <div className="flex items-center gap-2 text-sm">
                {Array.from({ length: form.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
