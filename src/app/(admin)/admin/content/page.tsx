import { requirePermissionPage } from "@/lib/guards/auth";
import { ContentEditor } from "@/components/admin/shared/content-editor";

export default async function ContentPage() {
  await requirePermissionPage("manage_content");
  return <ContentEditor />;
}
