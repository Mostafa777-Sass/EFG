import "server-only";
import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { getSettings } from "@/lib/content";

/**
 * hreflang alternates for a public page: the English and Arabic URLs of the same
 * page, with English as the default. Returns nothing while the Arabic version is
 * switched off in the admin settings, like the sitemap. Called from each page's
 * generateMetadata with that page's pathname; the layout cannot do it because it
 * does not know which page is being rendered.
 */
export async function localeAlternates(pathname: string): Promise<Metadata["alternates"]> {
  const settings = await getSettings();
  if (!settings.arabicEnabled) return undefined;
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const en = base + getPathname({ href: pathname, locale: "en" });
  const ar = base + getPathname({ href: pathname, locale: "ar" });
  return { languages: { en, ar, "x-default": en } };
}
