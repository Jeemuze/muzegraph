import PortfolioTagForm from "@/components/admin/portfolio-tags/portfolio-tag-form";
import { requirePermissionPage } from "@/lib/guards/auth";

export default async function EditPortfolioTagPage() {
  await requirePermissionPage("manage_portfolio_tag");

  return <PortfolioTagForm mode="edit" />;
}
