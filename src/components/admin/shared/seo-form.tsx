"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/admin/media/media-picker";

type SeoData = {
  id?: string;
  siteName?: string | null;
  siteUrl?: string | null;
  siteLogo?: string | null;
  siteLogoDark?: string | null;
  siteLogoLight?: string | null;
  favicon?: string | null;
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  robots?: string | null;
  canonicalUrl?: string | null;
  locale?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogType?: string | null;
  twitterCard?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  twitterSite?: string | null;
};

type MediaItem = { id: string; url: string; name: string };

export function SeoForm({ seo }: { seo: SeoData | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);

  const [form, setForm] = useState<SeoData>({
    siteName: seo?.siteName || "",
    siteUrl: seo?.siteUrl || "",
    siteLogo: seo?.siteLogo || "",
    siteLogoDark: seo?.siteLogoDark || "",
    siteLogoLight: seo?.siteLogoLight || "",
    favicon: seo?.favicon || "",
    title: seo?.title || "",
    description: seo?.description || "",
    keywords: seo?.keywords || "",
    robots: seo?.robots || "index, follow",
    canonicalUrl: seo?.canonicalUrl || "",
    locale: seo?.locale || "id_ID",
    ogTitle: seo?.ogTitle || "",
    ogDescription: seo?.ogDescription || "",
    ogImage: seo?.ogImage || "",
    ogType: seo?.ogType || "website",
    twitterCard: seo?.twitterCard || "summary_large_image",
    twitterTitle: seo?.twitterTitle || "",
    twitterDescription: seo?.twitterDescription || "",
    twitterImage: seo?.twitterImage || "",
    twitterSite: seo?.twitterSite || "",
  });

  useEffect(() => {
    fetch("/api/admin/media").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setAllMedia(data);
    }).catch(() => {});
  }, []);

  function getMediaIdByUrl(url: string | null | undefined) {
    if (!url) return "";
    return allMedia.find((m) => m.url === url)?.id || "";
  }

  function getMediaUrlById(id: string) {
    return allMedia.find((m) => m.id === id)?.url || "";
  }

  function mediaValue(url: string | null | undefined) {
    const id = getMediaIdByUrl(url);
    return id ? [id] : [];
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleMediaSelect(field: "siteLogo" | "siteLogoDark" | "siteLogoLight" | "favicon" | "ogImage" | "twitterImage", id: string | string[]) {
    const mediaId = typeof id === "string" ? id : id[0] || "";
    const url = getMediaUrlById(mediaId);
    setForm((prev) => ({ ...prev, [field]: url }));
  }

  function clearMedia(field: "siteLogo" | "siteLogoDark" | "siteLogoLight" | "favicon" | "ogImage" | "twitterImage") {
    setForm((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal update SEO");
      toast.success("SEO berhasil disimpan");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Site Info */}
      <section className="rounded-lg border border-border bg-background p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Site Info</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Site Name</label>
            <Input name="siteName" value={form.siteName || ""} onChange={handleChange} placeholder="My Website" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Site URL</label>
            <Input name="siteUrl" value={form.siteUrl || ""} onChange={handleChange} placeholder="https://example.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Canonical URL</label>
            <Input name="canonicalUrl" value={form.canonicalUrl || ""} onChange={handleChange} placeholder="https://example.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Locale</label>
            <Input name="locale" value={form.locale || ""} onChange={handleChange} placeholder="id_ID" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Logo Dark Mode</label>
            <p className="mb-2 text-xs text-muted-foreground">Ditampilkan saat tema gelap aktif</p>
            {form.siteLogoDark ? (
              <div className="relative inline-block rounded-md border bg-zinc-900 p-2">
                <img src={form.siteLogoDark} alt="Logo Dark" className="h-10 w-auto object-contain" />
                <button type="button" onClick={() => clearMedia("siteLogoDark")} className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-sm">
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <MediaPicker
                multiple={false}
                value={mediaValue(form.siteLogoDark)}
                onChange={(ids) => handleMediaSelect("siteLogoDark", ids)}
              />
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Logo Light Mode</label>
            <p className="mb-2 text-xs text-muted-foreground">Ditampilkan saat tema terang aktif</p>
            {form.siteLogoLight ? (
              <div className="relative inline-block rounded-md border bg-white p-2">
                <img src={form.siteLogoLight} alt="Logo Light" className="h-10 w-auto object-contain" />
                <button type="button" onClick={() => clearMedia("siteLogoLight")} className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-sm">
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <MediaPicker
                multiple={false}
                value={mediaValue(form.siteLogoLight)}
                onChange={(ids) => handleMediaSelect("siteLogoLight", ids)}
              />
            )}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Favicon</label>
          <p className="mb-2 text-xs text-muted-foreground">Ikon kecil yang tampil di tab browser (disarankan .ico, .png, atau .svg)</p>
          {form.favicon ? (
            <div className="relative inline-block rounded-md border p-2">
              <img src={form.favicon} alt="Favicon" className="h-8 w-8 object-contain" />
              <button type="button" onClick={() => clearMedia("favicon")} className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-sm">
                <X className="size-3" />
              </button>
            </div>
          ) : (
            <MediaPicker
              multiple={false}
              value={mediaValue(form.favicon)}
              onChange={(ids) => handleMediaSelect("favicon", ids)}
            />
          )}
        </div>
      </section>
      <section className="rounded-lg border border-border bg-background p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Meta Tags</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Title <span className="text-muted-foreground">({(form.title || "").length}/70)</span>
            </label>
            <Input name="title" value={form.title || ""} onChange={handleChange} placeholder="Default page title" maxLength={70} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Keywords</label>
            <Input name="keywords" value={form.keywords || ""} onChange={handleChange} placeholder="keyword1, keyword2" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Description <span className="text-muted-foreground">({(form.description || "").length}/160)</span>
          </label>
          <Textarea name="description" value={form.description || ""} onChange={handleChange} placeholder="Default meta description" maxLength={160} rows={3} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Robots</label>
          <Input name="robots" value={form.robots || ""} onChange={handleChange} placeholder="index, follow" />
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Open Graph */}
        <section className="rounded-lg border border-border bg-background p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Open Graph</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">OG Title</label>
            <Input name="ogTitle" value={form.ogTitle || ""} onChange={handleChange} placeholder="OG Title" maxLength={70} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">OG Type</label>
            <select name="ogType" value={form.ogType || "website"} onChange={handleChange} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="website">website</option>
              <option value="article">article</option>
              <option value="profile">profile</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">OG Description</label>
            <Textarea name="ogDescription" value={form.ogDescription || ""} onChange={handleChange} placeholder="OG Description" maxLength={200} rows={2} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">OG Image</label>
            {form.ogImage ? (
              <div className="relative inline-block">
                <img src={form.ogImage} alt="OG Image" className="h-24 w-auto rounded-md border object-cover" />
                <button type="button" onClick={() => clearMedia("ogImage")} className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-sm">
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <MediaPicker
                multiple={false}
                value={mediaValue(form.ogImage)}
                onChange={(ids) => handleMediaSelect("ogImage", ids)}
              />
            )}
          </div>
        </section>

        {/* Twitter */}
        <section className="rounded-lg border border-border bg-background p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Twitter Card</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">Card Type</label>
            <select name="twitterCard" value={form.twitterCard || "summary_large_image"} onChange={handleChange} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="summary">summary</option>
              <option value="summary_large_image">summary_large_image</option>
              <option value="app">app</option>
              <option value="player">player</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Twitter @site</label>
            <Input name="twitterSite" value={form.twitterSite || ""} onChange={handleChange} placeholder="@username" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Twitter Title</label>
            <Input name="twitterTitle" value={form.twitterTitle || ""} onChange={handleChange} placeholder="Twitter Title" maxLength={70} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Twitter Description</label>
            <Textarea name="twitterDescription" value={form.twitterDescription || ""} onChange={handleChange} placeholder="Twitter Description" maxLength={200} rows={2} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Twitter Image</label>
            {form.twitterImage ? (
              <div className="relative inline-block">
                <img src={form.twitterImage} alt="Twitter Image" className="h-24 w-auto rounded-md border object-cover" />
                <button type="button" onClick={() => clearMedia("twitterImage")} className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-sm">
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <MediaPicker
                multiple={false}
                value={mediaValue(form.twitterImage)}
                onChange={(ids) => handleMediaSelect("twitterImage", ids)}
              />
            )}
          </div>
        </section>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan SEO"}
      </Button>
    </form>
  );
}
