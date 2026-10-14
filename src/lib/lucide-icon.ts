import * as Icons from "lucide-react";
import { FolderTree } from "lucide-react";

export function getLucideIcon(name?: string | null) {
  if (!name) return FolderTree;

  const formatted = name
    .trim()
    .split("-")
    .map((part) =>
      part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join("");

  return (
    (Icons[formatted as keyof typeof Icons] as React.ElementType) ||
    FolderTree
  );
}
