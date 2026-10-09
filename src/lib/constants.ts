export const SESSION_COOKIE = "egf_admin_session";
export const SESSION_DAYS = 7;

// Public web address of the company, shown as a contact detail. Deliberately
// independent of NEXT_PUBLIC_SITE_URL, which is localhost in development and
// may be a bare IP on a staging server.
export const COMPANY_WEBSITE_URL = "https://egyptgasfittings.com";

export const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "products", href: "/products" },
  { key: "capabilities", href: "/capabilities" },
  { key: "quality", href: "/quality" },
  { key: "clients", href: "/clients" },
  { key: "facility", href: "/facility" },
  { key: "contact", href: "/contact" },
] as const;

export const CLIENT_TYPES = ["DOMESTIC", "EXPORT"] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];

export const INQUIRY_STATUSES = ["NEW", "IN_PROGRESS", "CLOSED"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const CONTENT_GROUPS: Record<string, string> = {
  hero: "Home hero",
  home: "Home page",
  about: "About page",
  capabilities: "Capabilities page",
  products: "Products page",
  quality: "Quality page",
  clients: "Clients page",
  facility: "Facility page",
  contact: "Contact page",
  cta: "Call to action band",
};
