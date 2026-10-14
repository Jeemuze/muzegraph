import PortfolioTagTable from "@/components/admin/portfolio-tags/portfolio-tag-table";
import { requirePermissionPage } from "@/lib/guards/auth";
import { getPortfolioTags } from "@/lib/services/portfolio-tag.service";

export default async function PortfolioTagsPage() {
  await requirePermissionPage("manage_portfolio_tag");

  const tags = await getPortfolioTags();

  return <PortfolioTagTable tags={tags} />;
}
  