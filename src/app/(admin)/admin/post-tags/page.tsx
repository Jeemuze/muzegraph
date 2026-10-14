import PostTagTable from "@/components/admin/post-tags/post-tag-table";
import { requirePermissionPage } from "@/lib/guards/auth";
import { getPostTags } from "@/lib/services/post-tag.service";

export default async function PostTagsPage() {
  await requirePermissionPage("manage_post_tags");

  const tags = await getPostTags();

  return (
    <div className="space-y-6">
      <PostTagTable tags={tags} />
    </div>
  );
}
