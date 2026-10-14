import { adminMenu } from "@/config/admin-menu";

export function getAdminTitle(segment?: string) {
  if (!segment) return "Dashboard";

  for (const item of adminMenu) {
    if (item.segment === segment) return item.title;

    if (item.items) {
      const found = item.items.find((sub) => sub.segment === segment);
      if (found) return found.title;
    }
  }

  return "Dashboard";
}
