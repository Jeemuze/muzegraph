import PortfolioTable from "@/components/admin/portfolios/portfolio-table";
import { requirePermissionPage } from "@/lib/guards/auth";
import { getPortfolios } from "@/lib/services/portfolio.service";

export default async function PortfoliosPage() {
  await requirePermissionPage("manage_portfolio");

  const portfolios = await getPortfolios();

  return <PortfolioTable portfolios={portfolios} />;
}
