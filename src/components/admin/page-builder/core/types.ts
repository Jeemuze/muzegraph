export type SectionType =
  | "hero"
  | "rich-content"
  | "contact-info";

export interface PageSectionItem {
  id: string;
  type: SectionType;
  order: number;
  isActive: boolean;
  content: Record<string, any>;
}
