import { requirePermissionPage } from "@/lib/guards/auth";
import { getHeroes } from "@/lib/services/hero.service";
import HeroTable from "@/components/admin/hero/hero-table";

export default async function HeroPage() {
  await requirePermissionPage("manage_hero");
  const heroes = await getHeroes();
  return <HeroTable heroes={heroes} />;
}
