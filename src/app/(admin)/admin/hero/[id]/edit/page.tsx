import { requirePermissionPage } from "@/lib/guards/auth";
import { getHeroById } from "@/lib/services/hero.service";
import HeroForm from "@/components/admin/hero/hero-form";
import { notFound } from "next/navigation";

export default async function EditHeroPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermissionPage("manage_hero");
  const { id } = await params;
  const hero = await getHeroById(id);
  if (!hero) notFound();

  return (
    <HeroForm
      mode="edit"
      heroId={hero.id}
      initialData={{
        type: hero.type,
        imageId: hero.imageId || "",
        imageIds: hero.images?.map((img) => img.mediaId) || [],
        videoUrl: hero.videoUrl || "",
        ctaPrimaryUrl: hero.ctaPrimaryUrl || "",
        ctaSecondaryUrl: hero.ctaSecondaryUrl || "",
        overlayOpacity: hero.overlayOpacity,
        isActive: hero.isActive,
        order: hero.order,
        translations: hero.translations?.map((t) => ({
          languageId: t.languageId,
          title: t.title || "",
          subtitle: t.subtitle || "",
          description: t.description || "",
          ctaPrimaryText: t.ctaPrimaryText || "",
          ctaSecondaryText: t.ctaSecondaryText || "",
        })) || [],
      }}
    />
  );
}
