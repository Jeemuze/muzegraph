import FaqCategoryForm from "@/components/admin/faq-categories/faq-category-form";
import { requirePermissionPage } from "@/lib/guards/auth";

export default async function CreateFaqCategoryPage() {
  await requirePermissionPage("manage_faq_category");

  return <FaqCategoryForm mode="create" />;
}
