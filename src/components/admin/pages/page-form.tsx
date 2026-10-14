"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Globe, Settings } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TiptapEditor } from "@/components/editor/tiptap-dynamic";
import { generateSlug } from "@/lib/utils/slug";

type FormMode = "create" | "edit";

type Translation = {
  languageId: string;
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
};

type Language = { id: string; code: string; name: string; isDefault?: boolean };

export default function PageForm({ mode }: { mode: FormMode }) {
  const router = useRouter();
  const params = useParams();
  const pageId = params?.id as string;

  const [languages, setLanguages] = useState<Language[]>([]);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [form, setForm] = useState({
    slug: "",
    status: "PUBLISHED",
    translations: [] as Translation[],
  });

  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        setInitialized(false);

        const langRes = await fetch("/api/admin/languages");
        const langData = await langRes.json();
        const langs: Language[] = (Array.isArray(langData) ? langData : langData.data || []).filter((l: any) => l.isActive !== false);
        setLanguages(langs);

        const defaultLang = langs.find((l) => l.isDefault) || langs[0];
        if (defaultLang) setActiveTab(defaultLang.id);

        if (mode === "create") {
          setForm({
            slug: "",
            status: "PUBLISHED",
            translations: langs.map((l) => ({ languageId: l.id, title: "", content: "[]", metaTitle: "", metaDescription: "" })),
          });
          setInitialized(true);
          return;
        }

        if (mode === "edit" && pageId) {
          const pageRes = await fetch(`/api/admin/pages/${pageId}`);
          if (!pageRes.ok) {
            toast.error("Failed to load page data");
            return;
          }
          const pageJson = await pageRes.json();
          const page = pageJson.data || pageJson;

          setForm({
            slug: page.slug || "",
            status: page.status || "PUBLISHED",
            translations: langs.map((lang) => {
              const existing = page.translations?.find((t: any) => t.languageId === lang.id);
              return { languageId: lang.id, title: existing?.title || "", content: existing?.content || "[]", metaTitle: existing?.metaTitle || "", metaDescription: existing?.metaDescription || "" };
            }),
          });
          setSlugTouched(true);
        }

        setInitialized(true);
      } catch (e: any) {
        toast.error(e.message || "Failed to initialize");
      }
    }

    init();
  }, [mode, pageId]);

  function updateTranslation(langId: string, field: keyof Translation, value: string) {
    setForm((prev) => ({
      ...prev,
      translations: prev.translations.map((t) => {
        if (t.languageId !== langId) return t;
        return { ...t, [field]: value };
      }),
    }));

    // Auto-generate slug from default language title if slug hasn't been manually touched
    if (field === "title" && !slugTouched) {
      const defaultLang = languages.find((l) => l.isDefault) || languages[0];
      if (langId === defaultLang?.id) {
        setForm((prev) => ({ ...prev, slug: generateSlug(value) }));
      }
    }
  }

  function getTranslation(langId: string) {
    return form.translations.find((t) => t.languageId === langId);
  }

  async function handleSubmit() {
    if (!form.slug.trim()) { toast.error("Slug is required"); return; }

    const defaultLang = languages.find((l) => l.isDefault) || languages[0];
    const defaultT = form.translations.find((t) => t.languageId === defaultLang?.id);
    if (!defaultT?.title.trim()) { toast.error("Default title is required"); return; }

    setLoading(true);
    try {
      const endpoint = mode === "edit" ? `/api/admin/pages/${pageId}` : "/api/admin/pages";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Save failed");
        return;
      }

      toast.success(mode === "edit" ? "Page updated" : "Page created");
      router.push("/admin/pages");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!initialized) {
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
            <h1 className="text-xl font-semibold tracking-tight">{mode === "create" ? "Create Page" : "Edit Page"}</h1>
            <p className="text-sm text-muted-foreground">Kelola halaman statis website Anda.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push("/admin/pages")} className="rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />Back
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="rounded-xl">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {loading ? "Saving..." : "Save Page"}
            </Button>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-6">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <h2 className="font-semibold">Content</h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="inline-flex h-auto flex-wrap gap-2 bg-transparent p-0">
                {languages.map((lang) => (
                  <TabsTrigger key={lang.id} value={lang.id} className="h-10 rounded-full border border-border bg-background px-4 text-xs font-semibold text-muted-foreground shadow-sm transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary">
                    {lang.code.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Page Title</Label>
                <Input placeholder="Enter page title" value={currentTranslation?.title || ""} onChange={(e) => updateTranslation(activeTab, "title", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <TiptapEditor key={activeTab} value={currentTranslation?.content || "[]"} onChange={(value) => updateTranslation(activeTab, "content", value)} />
                
              </div>
            </div>
          </div>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input placeholder="SEO title" value={currentTranslation?.metaTitle || ""} onChange={(e) => updateTranslation(activeTab, "metaTitle", e.target.value)} />
                <p className="text-xs text-muted-foreground text-right">{(currentTranslation?.metaTitle || "").length}/60</p>
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea rows={3} placeholder="SEO description" value={currentTranslation?.metaDescription || ""} onChange={(e) => updateTranslation(activeTab, "metaDescription", e.target.value)} />
                <p className="text-xs text-muted-foreground text-right">{(currentTranslation?.metaDescription || "").length}/160</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Publish</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input placeholder="page-slug" value={form.slug} onChange={(e) => { setSlugTouched(true); setForm((prev) => ({ ...prev, slug: e.target.value })); }} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-full rounded-2xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
