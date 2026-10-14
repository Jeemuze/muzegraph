import PortfolioForm from "@/components/admin/portfolios/portfolio-form";
import { requirePermissionPage } from "@/lib/guards/auth";

export default async function CreatePortfolioPage() {
  await requirePermissionPage("manage_portfolio");

  return <PortfolioForm mode="create" />;
}
