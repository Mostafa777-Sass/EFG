// Builds the web logo files from the client's raster logo. Run again whenever
// public/images/brand/logo-raster.jpeg changes:
//
//   node scripts/prepare-logo.mjs
//
// The source is a JPEG on a flat off-white background. This script keys that
// background out (soft edges, no halo), then writes:
//
//   public/images/brand/logo.webp        full lockup (gear + wordmark), transparent
//   public/images/brand/logo-light.webp  same lockup with a white wordmark, for dark panels
//   public/images/brand/logo-mark.webp   gear only, square, transparent
//   src/app/icon.png                     favicon (gear, 512 px, transparent)
//   src/app/apple-icon.png               iOS home-screen icon (gear on white, 180 px)
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const BRAND = path.join(ROOT, "public", "images", "brand");
const APP = path.join(ROOT, "src", "app");
const SRC = path.join(BRAND, "logo-raster.jpeg");

// Pixels this close to the background colour are treated as background (hides
// JPEG noise); from there alpha ramps up to fully opaque at FG_DISTANCE.
const DEAD_ZONE = 10;
const FG_DISTANCE = 200;
const EDGE_THRESHOLD = 24;

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
const colHas = new Array(width).fill(false);
const rowHas = new Array(height).fill(false);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (rgba[(y * width + x) * 4 + 3] > 0) {
      colHas[x] = true;
      rowHas[y] = true;
    }
  }
}
const first = (arr) => arr.indexOf(true);
const last = (arr) => arr.lastIndexOf(true);

const full = { left: first(colHas), top: first(rowHas), right: last(colHas), bottom: last(rowHas) };

// The mark is the first group of columns; it ends at the first run of 20+
// empty columns after it starts.
let markRight = full.left;
for (let x = full.left, gap = 0; x < width; x++) {
  if (colHas[x]) {
    gap = 0;
    markRight = x;
  } else if (++gap >= 20) break;
}
let markTop = height;
let markBottom = 0;
for (let y = 0; y < height; y++) {
  for (let x = full.left; x <= markRight; x++) {
    if (rgba[(y * width + x) * 4 + 3] > 0) {
      markTop = Math.min(markTop, y);
      markBottom = Math.max(markBottom, y);
      break;
    }
  }
}
const mark = { left: full.left, top: markTop, right: markRight, bottom: markBottom };

// Reversed variant for dark panels: the gear keeps its colours, the wordmark
// (everything to the right of the gear) becomes white.
const light = Buffer.from(rgba);
for (let y = 0; y < height; y++) {
  for (let x = markRight + 1; x < width; x++) {
    const o = (y * width + x) * 4;
    if (light[o + 3] > 0) light[o] = light[o + 1] = light[o + 2] = 255;
  }
}

async function crop(buffer, box, pad) {
  const w = box.right - box.left + 1;
  const h = box.bottom - box.top + 1;
  const p = Math.round(Math.max(w, h) * pad);
  return sharp(buffer, { raw: { width, height, channels: 4 } })
    .extract({ left: box.left, top: box.top, width: w, height: h })
    .extend({ top: p, bottom: p, left: p, right: p, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

const webp = { quality: 92, alphaQuality: 100 };

const fullPng = await crop(rgba, full, 0.02);
const fullOut = await sharp(fullPng).resize({ width: 1200 }).webp(webp).toFile(path.join(BRAND, "logo.webp"));
console.log(`logo.webp       ${fullOut.width} x ${fullOut.height}`);

const lightPng = await crop(light, full, 0.02);
const lightOut = await sharp(lightPng).resize({ width: 1200 }).webp(webp).toFile(path.join(BRAND, "logo-light.webp"));
console.log(`logo-light.webp ${lightOut.width} x ${lightOut.height}`);

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
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

const markOut = await sharp(square).resize(512, 512).webp(webp).toFile(path.join(BRAND, "logo-mark.webp"));
console.log(`logo-mark.webp  ${markOut.width} x ${markOut.height}`);

await sharp(square).resize(512, 512).png().toFile(path.join(APP, "icon.png"));
console.log("icon.png        512 x 512");

await sharp(square).resize(180, 180).flatten({ background: "#ffffff" }).png().toFile(path.join(APP, "apple-icon.png"));
console.log("apple-icon.png  180 x 180");
