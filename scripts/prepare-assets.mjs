// Converts the original EGF photography and logos into web-sized WebP files
// under public/images. Run once (or again when the source assets change):
//
//   pnpm assets:prepare
//
// Source folder defaults to the parent directory of the project (where the
// EGF_Batch_* folders live). Override with ASSETS_DIR=/path/to/assets.
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const SRC = path.resolve(process.env.ASSETS_DIR ?? path.join(ROOT, ".."));
const OUT = path.join(ROOT, "public", "images");

const PRODUCTS = "EGF_Batch_4_Our_Products_High_Quality";
const CLIENTS = "EGF_Batch_3_v2_Transparent_Upscaled_Logos";
const FACILITY = "EGF_Batch_1_Cover_and_Facility_High_Quality";

const jobs = [
  // Products: white background, max 1000 px
  ...[
    ["01_Product_Cooker_Flex.png", "cooker-flex"],
    ["02_Product_House_Entry_Tee.png", "house-entry-tee"],
    ["03_Product_House_Entry_Tee_63mm.png", "house-entry-tee-63mm"],
    ["04_Product_Gas_Meter_Union_Grooved.png", "gas-meter-union-grooved"],
    ["05_Product_Gas_Meter_Union.png", "gas-meter-union"],
    ["06_Product_Gas_Meter_Connector.png", "gas-meter-connector"],
    ["07_Product_Expansion_Bellow.png", "expansion-bellow"],
    ["08_Product_Compression_Adaptor_F612.png", "compression-adaptor-f612"],
    ["09_Product_Compression_Adaptor_F611.png", "compression-adaptor-f611"],
    ["10_Product_Adaptor_Fitting_FF.png", "adaptor-fitting-ff"],
    ["11_Product_Coupling.png", "coupling"],
  ].map(([file, slug]) => ({ src: `${PRODUCTS}/${file}`, out: `products/${slug}.webp`, max: 1000, quality: 88, flatten: true })),

  // Client logos: keep transparency, max 640 px
  ...[
    ["01_Clients_TAQA_Gas.png", "taqa-gas"],
    ["02_Clients_Fayum_Gas.png", "fayum-gas"],
    ["03_Clients_Modern_Gas.png", "modern-gas"],
    ["04_Clients_Egypt_Gas.png", "egypt-gas"],
    ["05_Clients_NATGAS.png", "natgas"],
    ["06_Clients_Overseas_Gas.png", "overseas-gas"],
    ["07_Clients_Town_Gas.png", "town-gas"],
    ["08_Clients_SIANKO.png", "sianko"],
    ["09_Clients_Sharjah_Electricity_Water_and_Gas_Authority.png", "sewa"],
    ["10_Clients_Maya_Gas.png", "maya-gas"],
  ].map(([file, slug]) => ({ src: `${CLIENTS}/${file}`, out: `clients/${slug}.webp`, max: 640, quality: 90, trim: true })),

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

  // Brand
  { src: "ChatGPT Image Sep 27, 2026, 09_02_59 PM.png", out: "brand/hero.webp", max: 1400, quality: 84, flatten: true },
  { src: "ChatGPT Image Sep 27, 2026, 09_02_59 PM.png", out: "brand/og-cover.jpg", og: true },
  { src: "ChatGPT Image Sep 27, 2026, 08_54_44 PM.png", out: "brand/logo-raster.webp", max: 800, quality: 92, whiteToAlpha: true, trim: true },
  { src: `${FACILITY}/01_Cover_Composite.png`, out: "brand/company-profile-cover.webp", max: 1200, quality: 84, flatten: true },
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

async function run() {
  let ok = 0;
  for (const job of jobs) {
    const src = path.join(SRC, job.src);
    const dest = path.join(OUT, job.out);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    try {
      let image = sharp(src, { failOn: "none" }).rotate();
      if (job.whiteToAlpha) image = await whiteToAlpha(image);
      if (job.trim) image = image.trim({ threshold: 8 });
      if (job.og) {
        await image.resize(1200, 630, { fit: "cover", position: "south" }).flatten({ background: "#ffffff" }).jpeg({ quality: 82 }).toFile(dest);
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
  console.log(`\n${ok}/${jobs.length} assets written to ${OUT}`);
}

run();
