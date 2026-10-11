// One-off content updates for data that lives in the database (editable in the
// admin), so the live site gets the same content as a fresh seed. Safe to re-run:
// a text row only changes while it still holds one of the exact old texts, so
// admin edits are never overwritten, and a product is only deleted if it exists.
//
//   pnpm content:update
//   (node --env-file-if-exists=.env scripts/update-content.mjs)
import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// key, old English texts, new English text, Arabic text (set only while the Arabic field is still empty)
const contentBlocks = [
  // 2026-10-10: the hero headline is the company name.
  ["hero.title", ["Precision fittings for gas connections", "Precision Fittings for Gas Connections"], "Egypt Gas Fittings", "مصر لوصلات الغاز"],
  // 2026-10-10: Title Case for headlines, matching messages/en.json.
  ["cta.title", ["Together for safer homes and stronger communities."], "Together for Safer Homes and Stronger Communities.", null],
  // 2026-10-11: full title on the About page leadership list. The three new leaders are
  // new content blocks, which the seed creates on its own (create-if-missing).
  ["about.ceo.title", ["CEO"], "Chief Executive Officer", null],
];

// old title, new title (facility gallery photos)
const facilityTitles = [
  ["Facility entrance", "Facility Entrance"],
  ["Production floor", "Production Floor"],
  ["Raw material stock", "Raw Material Stock"],
  ["CNC machining", "CNC Machining"],
  ["Crimping machine", "Crimping Machine"],
  ["Automatic welding machine", "Automatic Welding Machine"],
  ["Finished products", "Finished Products"],
  ["Packaging & dispatch", "Packaging & Dispatch"],
  ["Quality control lab", "Quality Control Lab"],
];

// Products that EGF confirmed do not exist (2026-10-11). Deleted by slug; the seed
// no longer creates them. A photo uploaded through the admin is removed from
// UPLOAD_DIR as well, the way the admin's delete does it. Inquiries that referred
// to the product keep their text and only lose the product link (onDelete: SetNull).
const removedProductSlugs = ["steel-hose-nipples-couplings"];

// Standards that EGF asked to drop from the list shown on the Quality page and the
// home page (2026-10-11). Only the matching lines go; the rest of the admin-edited
// value and its line endings stay as they are.
const removedStandards = ["BS 21"];

// Contact details corrected by EGF (2026-10-11): the first mobile number was dropped and the
// second one corrected to +20 106 654 5882. Applied only while the row still holds the old
// values. The map embed is set only while the field is empty; see the note in prisma/seed.mjs.
const OLD_MOBILE_1 = "+20 100 622 2181";
const OLD_MOBILE_2 = "+20 106 654 5852";
const NEW_MOBILE = "+20 106 654 5882";
const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6910!2d31.7479134!3d30.1417129!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1457f09ea87060d7%3A0x66ae79ad225600c2!2sBadr%20industrial%20zone!5e0!3m2!1sen!2seg!4v1760175000000!5m2!1sen!2seg";

let changed = 0;
for (const [key, oldTexts, textEn, textAr] of contentBlocks) {
  const result = await prisma.contentBlock.updateMany({ where: { key, textEn: { in: oldTexts } }, data: { textEn } });
  changed += result.count;
  if (textAr) {
    const arabic = await prisma.contentBlock.updateMany({ where: { key, textEn, OR: [{ textAr: null }, { textAr: "" }] }, data: { textAr } });
    changed += arabic.count;
  }
}
for (const [from, to] of facilityTitles) {
  const result = await prisma.facilityPhoto.updateMany({ where: { titleEn: from }, data: { titleEn: to } });
  changed += result.count;
}
for (const slug of removedProductSlugs) {
  const product = await prisma.product.findUnique({ where: { slug }, select: { id: true, nameEn: true, imageUrl: true } });
  if (!product) continue;
  await prisma.product.delete({ where: { id: product.id } });
  changed++;
  console.log(`Deleted product "${product.nameEn}" (${slug}).`);
  if (product.imageUrl && product.imageUrl.startsWith("/uploads/")) {
    const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? "./data/uploads");
    const file = path.resolve(uploadDir, ...product.imageUrl.slice("/uploads/".length).split("/"));
    if (file.startsWith(uploadDir + path.sep)) await fs.rm(file, { force: true });
  }
}

const settings = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { standards: true } });
if (settings?.standards) {
  const lines = settings.standards.split(/\r?\n/);
  const kept = lines.filter((line) => !removedStandards.includes(line.trim()));
  if (kept.length !== lines.length) {
    const separator = settings.standards.includes("\r\n") ? "\r\n" : "\n";
    await prisma.siteSettings.update({ where: { id: 1 }, data: { standards: kept.join(separator) } });
    changed++;
    console.log(`Removed ${lines.length - kept.length} line(s) from the standards list (${removedStandards.join(", ")}).`);
  }
}

const contact = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { mobile1: true, mobile2: true, mapEmbedUrl: true } });
if (contact) {
  const data = {};
  if (contact.mobile1 === OLD_MOBILE_1 && contact.mobile2 === OLD_MOBILE_2) {
    data.mobile1 = NEW_MOBILE;
    data.mobile2 = null;
  } else if (contact.mobile2 === OLD_MOBILE_2) {
    data.mobile2 = NEW_MOBILE;
  } else if (contact.mobile1 === OLD_MOBILE_1) {
    // The footer only shows mobiles when the first one is set, so move the remaining number up.
    data.mobile1 = contact.mobile2 ?? null;
    data.mobile2 = null;
  }
  if (!contact.mapEmbedUrl) data.mapEmbedUrl = MAP_EMBED_URL;
  if (Object.keys(data).length > 0) {
    await prisma.siteSettings.update({ where: { id: 1 }, data });
    changed++;
    console.log(`Updated contact settings: ${Object.keys(data).join(", ")}.`);
  }
}

// Home page logo order (2026-10-11): SEWA, the export partner, moves ahead of SIANKO. Applied only
// while the three rows still hold their seeded positions, so an admin reorder is never undone.
const logoOrder = [
  ["Sharjah Electricity, Water & Gas Authority (SEWA)", 10, 8],
  ["SIANKO", 8, 9],
  ["Maya Gas", 9, 10],
];
const positions = await prisma.client.findMany({
  where: { nameEn: { in: logoOrder.map(([name]) => name) } },
  select: { id: true, nameEn: true, sortOrder: true },
});
if (logoOrder.every(([name, from]) => positions.find((c) => c.nameEn === name)?.sortOrder === from)) {
  for (const [name, , to] of logoOrder) {
    await prisma.client.update({ where: { id: positions.find((c) => c.nameEn === name).id }, data: { sortOrder: to } });
  }
  changed += logoOrder.length;
  console.log("Moved SEWA ahead of SIANKO in the client logo order.");
}

// EGAS registration badge (2026-10-11), from the logo EGF supplied; only while the row has no image yet.
const egas = await prisma.certification.updateMany({
  where: { nameEn: "EGAS Registered", imageUrl: null },
  data: { imageUrl: "/images/quality/egas.webp" },
});
changed += egas.count;

console.log(`Content updates applied: ${changed} database change(s).`);
await prisma.$disconnect();
