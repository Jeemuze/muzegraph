import { SectionType } from "./types";

export const SECTION_REGISTRY: {
  type: SectionType;
  label: string;
  description: string;
}[] = [
  {
    type: "hero",
    label: "Hero Section",
    description: "Main banner / headline section",
  },
  {
    type: "rich-content",
    label: "Rich Content",
    description: "Text / HTML content block",
  },
  {
    type: "contact-info",
    label: "Contact Info",
    description: "Address, phone, email section",
  },
];
