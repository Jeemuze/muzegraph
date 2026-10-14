import FaqCategoryTable from "@/components/admin/faq-categories/faq-category-table";
import { requirePermissionPage } from "@/lib/guards/auth";
import { getFaqCategories } from "@/lib/services/faq-category.service";

export default async function FaqCategoriesPage() {
  await requirePermissionPage("manage_faq_category");

  const categories = await getFaqCategories();

  return <FaqCategoryTable categories={categories} />;
}
