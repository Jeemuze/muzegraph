import { requirePermissionPage } from "@/lib/guards/auth";
import { prisma } from "@/lib/prisma";
import { SeoForm } from "@/components/admin/shared/seo-form";

export default async function SeoPage() {
  await requirePermissionPage("manage_settings");

  const seo = await prisma.seo.findFirst();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SEO Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage meta tags, Open Graph, and Twitter Card for your website
        </p>
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <SeoForm seo={seo} />
      </div>
    </div>
  );
}
