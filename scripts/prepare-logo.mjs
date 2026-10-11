// Builds the web logo files from the client's raster logo. Run again whenever
// public/images/brand/logo.jpg changes:
//
//   node scripts/prepare-logo.mjs
//
// The source is the stacked lockup (gear-and-flame mark above the wordmark,
// the Arabic name and the tagline) on a flat off-white background. This script
// keys that background out (soft edges, no halo), then writes:
//
//   public/images/brand/logo-v2.webp                horizontal lockup (mark beside the text), transparent; header
//   public/images/brand/logo-light-v2.webp          same lockup with white text, for dark panels
//   public/images/brand/logo-stacked-v2.webp        the lockup as supplied, transparent
//   public/images/brand/logo-stacked-light-v2.webp  same with white text; footer
//   public/images/brand/logo-mark-v2.webp           mark only, square, transparent; admin panel
//   src/app/icon.png                                favicon (mark, 512 px, transparent)
//   src/app/apple-icon.png                          iOS home-screen icon (mark on white, 180 px)
//
// The "-v2" suffix is deliberate: Next's image optimizer caches resized copies
// by URL for hours, so a new picture under an old name keeps showing the old
// picture at some sizes. Bump the suffix when the artwork changes again.
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const BRAND = path.join(ROOT, "public", "images", "brand");
const APP = path.join(ROOT, "src", "app");
const SRC = path.join(BRAND, "logo.jpg");
const SUFFIX = "-v2";

// Pixels this close to the background colour are treated as background (hides
// JPEG noise); from there alpha ramps up to fully opaque at FG_DISTANCE.
const DEAD_ZONE = 10;
const FG_DISTANCE = 200;
const EDGE_THRESHOLD = 24;
// A run of this many empty rows separates the mark from the text block.
const ROW_GAP = 20;

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;
const px = (x, y) => (y * width + x) * 3;

// Background colour: average of the four corners.
const corners = [px(0, 0), px(width - 1, 0), px(0, height - 1), px(width - 1, height - 1)];
const bg = [0, 1, 2].map((c) => Math.round(corners.reduce((s, i) => s + data[i + c], 0) / 4));

const distance = (i) => Math.max(Math.abs(data[i] - bg[0]), Math.abs(data[i + 1] - bg[1]), Math.abs(data[i + 2] - bg[2]));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Pass 1: hard mask of "clearly foreground" pixels.
const hard = new Uint8Array(width * height);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) hard[y * width + x] = distance(px(x, y)) > EDGE_THRESHOLD ? 1 : 0;
}

// Pass 2: interior pixels (all 8 neighbours are foreground) stay fully opaque
// with their original colour; everything else gets a soft alpha and is
// un-blended from the background so there is no light fringe on dark panels.
const rgba = Buffer.alloc(width * height * 4);
const interior = (x, y) => {
  if (x === 0 || y === 0 || x === width - 1 || y === height - 1) return false;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (!hard[(y + dy) * width + (x + dx)]) return false;
  return true;
};
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = px(x, y);
    const o = (y * width + x) * 4;
    if (interior(x, y)) {
      rgba[o] = data[i];
      rgba[o + 1] = data[i + 1];
      rgba[o + 2] = data[i + 2];
      rgba[o + 3] = 255;
      continue;
    }
    const a = clamp((distance(i) - DEAD_ZONE) / (FG_DISTANCE - DEAD_ZONE), 0, 1);
    if (a === 0) continue;
    for (let c = 0; c < 3; c++) rgba[o + c] = clamp(Math.round((data[i + c] - (1 - a) * bg[c]) / a), 0, 255);
    rgba[o + 3] = Math.round(a * 255);
  }
}

// Bounding boxes from the alpha channel.
const alphaAt = (x, y) => rgba[(y * width + x) * 4 + 3];
const rowHas = new Array(height).fill(false);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (alphaAt(x, y) > 0) {
      rowHas[y] = true;
      break;
    }
  }
}
const firstRow = rowHas.indexOf(true);
const lastRow = rowHas.lastIndexOf(true);

/** Bounding box of the foreground pixels within a band of rows. */
function box(top, bottom) {
  let left = width;
  let right = -1;
  for (let y = top; y <= bottom; y++) {
    for (let x = 0; x < width; x++) {
      if (alphaAt(x, y) > 0) {
        left = Math.min(left, x);
        right = Math.max(right, x);
      }
    }
  }
  return { left, top, right, bottom };
}

// The mark is the first group of rows; it ends at the first run of ROW_GAP
// empty rows after it starts. The text block is everything below that gap.
let markBottom = firstRow;
for (let y = firstRow, gap = 0; y < height; y++) {
  if (rowHas[y]) {
    gap = 0;
    markBottom = y;
  } else if (++gap >= ROW_GAP) break;
}
let textTop = markBottom + 1;
while (textTop < height && !rowHas[textTop]) textTop++;

const full = box(firstRow, lastRow);
const mark = box(firstRow, markBottom);
const text = box(textTop, lastRow);

// Reversed variant for dark panels: the mark keeps its colours, every text
// pixel becomes white.
const light = Buffer.from(rgba);
for (let y = textTop; y <= lastRow; y++) {
  for (let x = 0; x < width; x++) {
    const o = (y * width + x) * 4;
    if (light[o + 3] > 0) light[o] = light[o + 1] = light[o + 2] = 255;
  }
}

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

/** Crops a box out of an RGBA buffer, with optional padding, as a PNG buffer. */
async function crop(buffer, b, pad = 0) {
  const w = b.right - b.left + 1;
  const h = b.bottom - b.top + 1;
  const p = Math.round(Math.max(w, h) * pad);
  return sharp(buffer, { raw: { width, height, channels: 4 } })
    .extract({ left: b.left, top: b.top, width: w, height: h })
    .extend({ top: p, bottom: p, left: p, right: p, background: transparent })
    .png()
    .toBuffer();
}

/** Mark beside the text block, the mark as tall as the text. */
async function horizontal(buffer) {
  const textH = text.bottom - text.top + 1;
  const textW = text.right - text.left + 1;
  const markPng = await sharp(await crop(buffer, mark)).resize({ height: textH }).png().toBuffer();
  const markW = (await sharp(markPng).metadata()).width;
  const gap = Math.round(textH * 0.14);
  const pad = Math.round(textH * 0.03);
  return sharp({ create: { width: markW + gap + textW + pad * 2, height: textH + pad * 2, channels: 4, background: transparent } })
    .composite([
      { input: markPng, left: pad, top: pad },
      { input: await crop(buffer, text), left: pad + markW + gap, top: pad },
    ])
    .png()
    .toBuffer();
}

const webp = { quality: 92, alphaQuality: 100 };
const report = (name, out) => console.log(`${name.padEnd(28)} ${out.width} x ${out.height}`);

report(`logo${SUFFIX}.webp`, await sharp(await horizontal(rgba)).resize({ width: 1200 }).webp(webp).toFile(path.join(BRAND, `logo${SUFFIX}.webp`)));
report(`logo-light${SUFFIX}.webp`, await sharp(await horizontal(light)).resize({ width: 1200 }).webp(webp).toFile(path.join(BRAND, `logo-light${SUFFIX}.webp`)));
report(`logo-stacked${SUFFIX}.webp`, await sharp(await crop(rgba, full, 0.02)).resize({ width: 900 }).webp(webp).toFile(path.join(BRAND, `logo-stacked${SUFFIX}.webp`)));
report(`logo-stacked-light${SUFFIX}.webp`, await sharp(await crop(light, full, 0.02)).resize({ width: 900 }).webp(webp).toFile(path.join(BRAND, `logo-stacked-light${SUFFIX}.webp`)));

// Mark: pad to a square so it sits centred in favicons and avatars.
const markPng = await crop(rgba, mark, 0.04);
const markMeta = await sharp(markPng).metadata();
const side = Math.max(markMeta.width, markMeta.height);
const square = await sharp(markPng)
  .extend({
    top: Math.floor((side - markMeta.height) / 2),
    bottom: Math.ceil((side - markMeta.height) / 2),
    left: Math.floor((side - markMeta.width) / 2),
    right: Math.ceil((side - markMeta.width) / 2),
    background: transparent,
  })
  .png()
  .toBuffer();

report(`logo-mark${SUFFIX}.webp`, await sharp(square).resize(512, 512).webp(webp).toFile(path.join(BRAND, `logo-mark${SUFFIX}.webp`)));
await sharp(square).resize(512, 512).png().toFile(path.join(APP, "icon.png"));
console.log("icon.png                     512 x 512");
await sharp(square).resize(180, 180).flatten({ background: "#ffffff" }).png().toFile(path.join(APP, "apple-icon.png"));
console.log("apple-icon.png               180 x 180");
