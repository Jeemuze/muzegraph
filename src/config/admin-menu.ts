import {
  PieChartIcon,
  BookOpenIcon,
  ImageIcon,
  BriefcaseIcon,
  MessageSquareIcon,
  Settings2Icon,
  NewspaperIcon,
  MessageCircleQuestionMark,
  Layers2,
  PanelsTopLeft,
  InboxIcon,
} from "lucide-react";

export const adminMenu = [
  {
    title: "Dashboard",
    url: "/admin",
    segment: "admin",
    icon: PieChartIcon,
  },

  {
    title: "Hero",
    url: "/admin/hero",
    segment: "hero",
    icon: ImageIcon,
    permission: "manage_hero",
  },

    {
    title: "Pages",
    url: "/admin/pages",
    segment: "pages",
    icon: PanelsTopLeft,
    permission: "manage_pages",
  },

  {
    title: "FAQ",
    icon: MessageCircleQuestionMark,
    segment: "faqs",
    permission: "manage_faq",
    items: [
      {
        title: "All FAQ",
        url: "/admin/faqs",
        segment: "faqs",
        permission: "manage_faq",
      },
      {
        title: "FAQ Category",
        url: "/admin/faq-categories",
        segment: "faq-categories",
        permission: "manage_faq_category",
      },
    ],
  },

  {
    title: "Service",
    url: "/admin/service",
    segment: "service",
    icon: BriefcaseIcon,
    permission: "manage_service",
  },

  {
    title: "Blog",
    icon: NewspaperIcon,
    segment: "blog",
    permission: "manage_blog",
    items: [
      {
        title: "All Posts",
        url: "/admin/blog",
        segment: "blog",
        permission: "manage_blog",
      },
      {
        title: "Comments",
        url: "/admin/comments",
        segment: "comments",
        permission: "manage_blog",
      },
      {
        title: "Category",
        url: "/admin/post-categories",
        segment: "post-categories",
        permission: "manage_post_categories",
      },
      {
        title: "Tag",
        url: "/admin/post-tags",
        segment: "post-tags",
        permission: "manage_post_tags",
      },
    ],
  },

  {
    title: "Portfolio",
    icon: Layers2,
    segment: "portfolios",
    permission: "manage_portfolio",
    items: [
      {
        title: "All Portfolio",
        url: "/admin/portfolios",
        segment: "portfolios",
        permission: "manage_portfolio",
      },
      {
        title: "Portfolio Tag",
        url: "/admin/portfolio-tags",
        segment: "portfolio-tags",
        permission: "manage_portfolio",
      },
    ],
  },

  {
    title: "Testimonial",
    url: "/admin/testimonials",
    segment: "testimonials",
    icon: MessageSquareIcon,
    permission: "manage_testimonial",
  },

  {
    title: "Contacts",
    url: "/admin/contacts",
    segment: "contacts",
    icon: InboxIcon,
    permission: "manage_blog",
  },

  {
    title: "Media Manager",
    url: "/admin/media",
    segment: "media",
    icon: BookOpenIcon,
    permission: "manage_media",
  },

  {
    title: "System",
    icon: Settings2Icon,
    items: [
      {
        title: "User",
        url: "/admin/users",
        segment: "users",
        permission: "manage_users",
      },
      {
        title: "Role",
        url: "/admin/roles",
        segment: "roles",
        permission: "manage_users",
      },
      {
        title: "Permission",
        url: "/admin/permissions",
        segment: "permissions",
        permission: "manage_permissions",
      },
      {
        title: "Setting",
        url: "/admin/settings",
        segment: "settings",
        permission: "manage_settings",
      },
      {
        title: "SEO",
        url: "/admin/seo",
        segment: "seo",
        permission: "manage_seo",
      },
    ],
  },
];
