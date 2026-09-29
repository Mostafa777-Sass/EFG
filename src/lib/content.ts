import "server-only";
import { cache } from "react";
import type { SiteSettings } from "@prisma/client";
import { prisma } from "./db";
import { pick } from "./l10n";

/* ---- Settings -------------------------------------------------------------- */

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const existing = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.siteSettings.create({ data: { id: 1 } });
});

/* ---- Content blocks -------------------------------------------------------- */

export const getContentBlocks = cache(async () => {
  const rows = await prisma.contentBlock.findMany({ orderBy: [{ group: "asc" }, { sortOrder: "asc" }] });
  return rows;
});

/** Returns a function that resolves a content block key for the given locale. */
export async function getContentPicker(locale: string) {
  const rows = await getContentBlocks();
  const map = new Map(rows.map((r) => [r.key, r]));
  return (key: string, fallback = ""): string => {
    const row = map.get(key);
    if (!row) return fallback;
    return pick(locale, row.textEn, row.textAr) || fallback;
  };
}

/* ---- Catalogue ------------------------------------------------------------- */

export const getCategories = cache(async () =>
  prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
    include: { _count: { select: { products: { where: { published: true } } } } },
  }),
);

export const getPublishedProducts = cache(async (opts: { categorySlug?: string; featured?: boolean; take?: number } = {}) =>
  prisma.product.findMany({
    where: {
      published: true,
      ...(opts.featured ? { featured: true } : {}),
      ...(opts.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
    include: { category: true },
    ...(opts.take ? { take: opts.take } : {}),
  }),
);

export const getProductBySlug = cache(async (slug: string) =>
  prisma.product.findFirst({ where: { slug, published: true }, include: { category: true } }),
);

/* ---- Company content ------------------------------------------------------- */

export const getClients = cache(async () =>
  prisma.client.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }] }),
);

export const getFacilityPhotos = cache(async (take?: number) =>
  prisma.facilityPhoto.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }],
    ...(take ? { take } : {}),
  }),
);

export const getCertifications = cache(async () =>
  prisma.certification.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }] }),
);
