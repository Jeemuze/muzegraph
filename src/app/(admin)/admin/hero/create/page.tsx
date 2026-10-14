import { requirePermissionPage } from "@/lib/guards/auth";
import HeroForm from "@/components/admin/hero/hero-form";

export default async function CreateHeroPage() {
  await requirePermissionPage("manage_hero");
  return <HeroForm mode="create" />;
}
