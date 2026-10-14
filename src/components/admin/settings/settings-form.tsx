"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save } from "lucide-react";

type Setting = { id: string; key: string; value: string };
type Props = { settings: Setting[] };

const labels: Record<string, { label: string; description: string }> = {
  contact_email: { label: "Email", description: "Email kontak utama" },
  contact_phone: { label: "Phone", description: "Nomor telepon" },
  contact_whatsapp: { label: "WhatsApp", description: "Nomor WhatsApp (tanpa +)" },
  address: { label: "Address", description: "Alamat lengkap" },
  social_instagram: { label: "Instagram", description: "URL profil Instagram" },
  social_linkedin: { label: "LinkedIn", description: "URL profil LinkedIn" },
  social_github: { label: "GitHub", description: "URL profil GitHub" },
  working_hours: { label: "Working Hours", description: "Jam operasional" },
};

export default function SettingsForm({ settings: initial }: Props) {
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);

  const update = (key: string, value: string) => {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings.map((s) => ({ key: s.key, value: s.value }))),
      });
      if (res.ok) toast.success("Settings saved");
      else toast.error("Failed to save");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {settings.map((s) => {
          const meta = labels[s.key] || { label: s.key, description: "" };
          return (
            <div key={s.id} className="rounded-lg border border-border bg-background p-4">
              <label className="text-sm font-medium text-foreground">{meta.label}</label>
              {meta.description && <p className="text-xs text-muted-foreground mb-2">{meta.description}</p>}
              <input
                type="text"
                value={s.value}
                onChange={(e) => update(s.key, e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          );
        })}
      </div>

      <Button onClick={save} disabled={saving} className="gap-2">
        <Save className="size-4" />
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
