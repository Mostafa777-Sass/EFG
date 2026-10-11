// Converts the original EGF photography and logos into web-sized WebP files
// under public/images. Run once (or again when the source assets change):
//
//   pnpm assets:prepare                                    (every job)
//   node scripts/prepare-assets.mjs clients quality/egas.webp
//                      (only the outputs under clients/ plus that one file)
//
// Source folder defaults to the parent directory of the project (where the
// EGF_Batch_* folders live). Override with ASSETS_DIR=/path/to/assets. Only
// EGF_Batch_4 (products) is still around; the client logos and the EGAS badge
// are built from the JPEGs checked in under public/images/clients.
//
// A full run rewrites the product photos WITHOUT the EGF marking: run
// scripts/mark-products.mjs afterwards, or pass a filter as shown above.
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const SRC = path.resolve(process.env.ASSETS_DIR ?? path.join(ROOT, ".."));
const OUT = path.join(ROOT, "public", "images");

const PRODUCTS = "EGF_Batch_4_Our_Products_High_Quality";
const FACILITY = "EGF_Batch_1_Cover_and_Facility_High_Quality";
const CLIENT_SOURCES = path.join(ROOT, "public", "images", "clients");

const jobs = [
  // Products: white background, max 1000 px
  ...[
    ["01_Product_Cooker_Flex.png", "cooker-flex"],
    ["02_Product_House_Entry_Tee.png", "house-entry-tee"],
    ["03_Product_House_Entry_Tee_63mm.png", "house-entry-tee-63mm"],
    // Batch files 04 and 05 are labelled the wrong way round: 04 shows the plain union
    // (BSPT male thread) and 05 the grooved one (confirmed by EGF, 2026-10-11).
    ["04_Product_Gas_Meter_Union_Grooved.png", "gas-meter-union"],
    ["05_Product_Gas_Meter_Union.png", "gas-meter-union-grooved"],
    ["06_Product_Gas_Meter_Connector.png", "gas-meter-connector"],
    ["08_Product_Compression_Adaptor_F612.png", "compression-adaptor-f612"],
    ["09_Product_Compression_Adaptor_F611.png", "compression-adaptor-f611"],
    ["10_Product_Adaptor_Fitting_FF.png", "adaptor-fitting-ff"],
    ["11_Product_Coupling.png", "coupling"],
  ].map(([file, slug]) => ({ src: `${PRODUCTS}/${file}`, out: `products/${slug}.webp`, max: 1000, quality: 88, flatten: true })),
  // Expansion bellow: EGF replaced the batch-4 photo on 2026-10-11 with this JPEG, checked in next to
  // the output as the source (the batch file 07_Product_Expansion_Bellow.png shows the wrong part).
  // The JPEG sits on a light grey studio backdrop; whitenBackground lifts that to white so the
  // photo matches the other product cards.
  { src: path.join(ROOT, "public", "images", "products", "expansion-bellow.jpg"), out: "products/expansion-bellow.webp", max: 1000, quality: 88, flatten: true, whitenBackground: true },

  // Client logos, max 640 px. EGF supplied new files on 2026-10-11 as JPEGs, kept next to the
  // outputs as public/images/clients/<slug>.jpg (the EGF_Batch_3 PNGs are no longer at hand).
  // Most sit on a white canvas and stay opaque; natgas and sianko were flattened onto black,
  // so that canvas is keyed out. town-gas.webp still comes from the old batch file and has no
  // new source, so it has no job here.
  ...[
    ["taqa-gas"],
    ["fayum-gas"],
    ["modern-gas"],
    ["egypt-gas"],
    ["natgas", { darkCanvas: true }],
    ["overseas-gas"],
    ["sianko", { darkCanvas: true }],
    ["sewa"],
    ["maya-gas"],
  ].map(([slug, opts = {}]) => ({
    src: path.join(CLIENT_SOURCES, `${slug}.jpg`),
    out: `clients/${slug}.webp`,
    max: 640,
    quality: 90,
    trim: 24,
    keyOutDark: Boolean(opts.darkCanvas),
    flatten: !opts.darkCanvas,
  })),

  // Facility photography, max 1600 px
  ...[
    ["08_Facility_Entrance.png", "entrance"],
    ["09_Facility_Production_Floor.jpeg", "production-floor"],
    ["02_Facility_Raw_Material_Stock.jpeg", "raw-material-stock"],
    ["03_Facility_CNC_Machining.jpeg", "cnc-machining"],
    ["04_Facility_Crimping_Machine.jpeg", "crimping-machine"],
    ["05_Facility_Automatic_Welding_Machine.jpeg", "automatic-welding-machine"],
    ["06_Facility_Finished_Products.jpeg", "finished-products"],
    ["07_Facility_Packaging_and_Dispatch.jpeg", "packaging-dispatch"],
  ].map(([file, slug]) => ({ src: `${FACILITY}/${file}`, out: `facility/${slug}.webp`, max: 1600, quality: 82, flatten: true })),
  { src: "04_Quality_Control_Lab.jpg", out: "facility/quality-control-lab.webp", max: 1600, quality: 82, flatten: true },

  // Certification badges
  { src: "01_Quality_ISO_9001.png", out: "quality/iso-9001.webp", max: 600, quality: 90, trim: true },
  { src: "02_Quality_EOS_Certified.png", out: "quality/eos.webp", max: 600, quality: 90, trim: true },
  // EGAS registration badge (Quality page and home page), from the logo EGF supplied with the client files.
  { src: path.join(CLIENT_SOURCES, "egas.jpg"), out: "quality/egas.webp", max: 600, quality: 90, trim: 24, flatten: true },

  // Brand. The home hero and the social-sharing cover come from the client's
  // photo checked in at public/images/brand/hero.jpeg. The logo files are built
  // separately by scripts/prepare-logo.mjs from public/images/brand/logo.jpg.
  // If the hero photo is replaced, give the output a new file name: Next's image
  // optimizer caches resized copies by URL for hours, so a new picture under an
  // old name keeps showing the old picture at some screen sizes.
  { src: path.join(ROOT, "public", "images", "brand", "hero.jpeg"), out: "brand/home-hero.webp", max: 1600, quality: 85, flatten: true },
  { src: path.join(ROOT, "public", "images", "brand", "hero.jpeg"), out: "brand/og-cover.jpg", og: true },
];

/** Turns near-white pixels transparent and un-blends edge colours. */
async function whiteToAlpha(image) {
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = 255 - Math.min(r, g, b);
    if (alpha === 0) {
      out[i] = out[i + 1] = out[i + 2] = out[i + 3] = 0;
      continue;
    }
    const k = 255 - alpha;
    out[i] = clamp(((r - k) * 255) / alpha);
    out[i + 1] = clamp(((g - k) * 255) / alpha);
    out[i + 2] = clamp(((b - k) * 255) / alpha);
    out[i + 3] = alpha;
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
}

/**
 * Makes the flat dark canvas that touches the image border transparent (a flood fill from
 * the edges), for logos that were saved as JPEG on black. Dark pixels inside the logo stay.
 * A logo pixel next to the canvas was blended with black by the JPEG, so it takes the colour
 * of a solid neighbour and an alpha estimated from its brightness relative to that neighbour.
 */
async function keyOutDarkBorder(image, threshold = 48) {
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const brightness = (idx) => Math.max(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]);
  const canvas = new Uint8Array(width * height);
  const stack = [];
  const visit = (x, y) => {
    const idx = y * width + x;
    if (!canvas[idx] && brightness(idx) <= threshold) {
      canvas[idx] = 1;
      stack.push(idx);
    }
  };
  for (let x = 0; x < width; x++) {
    visit(x, 0);
    visit(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    visit(0, y);
    visit(width - 1, y);
  }
  while (stack.length) {
    const idx = stack.pop();
    const x = idx % width;
    const y = (idx - x) / width;
    if (x > 0) visit(x - 1, y);
    if (x < width - 1) visit(x + 1, y);
    if (y > 0) visit(x, y - 1);
    if (y < height - 1) visit(x, y + 1);
  }
  const out = Buffer.from(data);
  const around = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]];
  for (let idx = 0; idx < width * height; idx++) {
    if (canvas[idx]) {
      out[idx * 4 + 3] = 0;
      continue;
    }
    const x = idx % width;
    const y = (idx - x) / width;
    let touchesCanvas = false;
    let solid = -1;
    for (const [dx, dy] of around) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const n = ny * width + nx;
      if (canvas[n]) touchesCanvas = true;
      else if (solid < 0 && brightness(n) > threshold * 2) solid = n;
    }
    if (!touchesCanvas || solid < 0) continue;
    const alpha = Math.max(0, Math.min(1, brightness(idx) / Math.max(1, brightness(solid))));
    out[idx * 4] = data[solid * 4];
    out[idx * 4 + 1] = data[solid * 4 + 1];
    out[idx * 4 + 2] = data[solid * 4 + 2];
    out[idx * 4 + 3] = Math.round(255 * alpha);
  }
  return sharp(out, { raw: { width, height, channels: 4 } });
}

// Optional arguments limit the run to output folders (clients) or exact output paths (quality/egas.webp).
const only = process.argv.slice(2);
const selected = only.length ? jobs.filter((job) => only.some((f) => job.out === f || job.out.startsWith(`${f}/`))) : jobs;

async function run() {
  let ok = 0;
  for (const job of selected) {
    const src = path.resolve(SRC, job.src);
    const dest = path.join(OUT, job.out);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    try {
      let image = sharp(src, { failOn: "none" }).rotate();
      if (job.whiteToAlpha) image = await whiteToAlpha(image);
      if (job.trim) image = image.trim({ threshold: typeof job.trim === "number" ? job.trim : 8 });
      if (job.keyOutDark) image = await keyOutDarkBorder(image);
      if (job.whitenBackground) {
        // Scale the levels so the backdrop colour in the top-left corner becomes pure white.
        const { data } = await image.clone().raw().toBuffer({ resolveWithObject: true });
        const backdrop = Math.max(data[0], data[1], data[2]) || 255;
        image = image.linear(255 / backdrop, 0);
      }
      if (job.og) {
        await image.resize(1200, 630, { fit: "cover", position: "centre" }).flatten({ background: "#ffffff" }).jpeg({ quality: 82 }).toFile(dest);
      } else {
        image = image.resize({ width: job.max, height: job.max, fit: "inside", withoutEnlargement: true });
        if (job.flatten) image = image.flatten({ background: "#ffffff" });
        await image.webp({ quality: job.quality }).toFile(dest);
      }
      const meta = await sharp(dest).metadata();
      const size = (await fs.stat(dest)).size;
      console.log(`${job.out.padEnd(44)} ${String(meta.width).padStart(5)}x${String(meta.height).padEnd(5)} ${(size / 1024).toFixed(0).padStart(5)} KB`);
      ok++;
    } catch (error) {
      console.error(`FAILED ${job.out}: ${error.message}`);
    }
  }
  console.log(`\n${ok}/${selected.length} assets written to ${OUT}`);
}

run();
