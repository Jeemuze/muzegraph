import { requirePermissionPage } from "@/lib/guards/auth";
import PostCategoryTable from "@/components/admin/post-categories/post-category-table";
import { getPostCategories } from "@/lib/services/post-category.service";

export default async function PostCategoriesPage() {
  await requirePermissionPage("manage_post_categories");

  const categories = await getPostCategories();

  return (
    <div className="space-y-6">
      <PostCategoryTable categories={categories} />
    </div>
  );
}
