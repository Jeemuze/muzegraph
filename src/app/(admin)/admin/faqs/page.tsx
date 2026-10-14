import FaqTable from "@/components/admin/faqs/faq-table";
import { requirePermissionPage } from "@/lib/guards/auth";
import { getFaqs } from "@/lib/services/faq.service";

export default async function FaqsPage() {
  await requirePermissionPage("manage_faq");

  const faqs = await getFaqs();

  return <FaqTable faqs={faqs} />;
}
