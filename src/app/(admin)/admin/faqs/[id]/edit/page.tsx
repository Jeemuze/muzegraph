import FaqForm from "@/components/admin/faqs/faq-form";
import { requirePermissionPage } from "@/lib/guards/auth";

export default async function EditFaqPage() {
  await requirePermissionPage("manage_faq");

  return <FaqForm mode="edit" />;
}
