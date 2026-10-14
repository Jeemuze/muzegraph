import { prisma } from "@/lib/prisma";
import { requirePermissionPage } from "@/lib/guards/auth";
import SettingsForm from "@/components/admin/settings/settings-form";

export default async function SettingsPage() {
  await requirePermissionPage("manage_settings");

  const settings = await prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  const data = settings.map((s) => ({ id: s.id, key: s.key, value: s.value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage site contact information and social links</p>
      </div>
      <SettingsForm settings={data} />
    </div>
  );
}
