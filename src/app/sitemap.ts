import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const PAGES = ["", "/about", "/products", "/capabilities", "/quality", "/clients", "/facility", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const [settings, products] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 1 }, select: { arabicEnabled: true } }),
    prisma.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const locales = settings?.arabicEnabled ? ["en", "ar"] : ["en"];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const prefix = locale === "en" ? "" : "/ar";
    for (const page of PAGES) {
      entries.push({
        url: `${base}${prefix}${page || (prefix ? "" : "/")}`,
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1 : 0.7,
      });
    }
    for (const product of products) {
      entries.push({
        url: `${base}${prefix}/products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }
  return entries;
}
