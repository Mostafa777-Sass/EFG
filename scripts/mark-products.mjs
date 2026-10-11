// Adds the EGF marking to the product photos that were shot without one, so
// every product carries the brand the way the hoses and house-entry tees do.
// Reads the original photos from the EGF_Batch_4 folder (next to the project,
// or ASSETS_DIR) and overwrites public/images/products/<slug>.webp.
//
//   node scripts/mark-products.mjs
//
// After replacing images under the same name, clear Next's optimizer cache
// (.next/cache/images) or the old picture keeps showing at some sizes.
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const SRC = path.resolve(process.env.ASSETS_DIR ?? path.join(ROOT, ".."), "EGF_Batch_4_Our_Products_High_Quality");
const OUT = path.join(ROOT, "public", "images", "products");

// x, y: centre of the label in the 480 x 680 photo. skewY and scaleX follow the
// face the text sits on (a hex face seen at an angle); light = white text for
// dark surfaces such as the rubber hose.
const MARKS = [
  { file: "10_Product_Adaptor_Fitting_FF.png", slug: "adaptor-fitting-ff", lines: ["EGF", "BS EN 12165"], x: 322, y: 505, size: 30, skewY: 6, scaleX: 0.9 },
  { file: "09_Product_Compression_Adaptor_F611.png", slug: "compression-adaptor-f611", lines: ["EGF", "BS EN 1254-2"], x: 292, y: 186, size: 20, skewY: 6, scaleX: 0.85 },
  { file: "08_Product_Compression_Adaptor_F612.png", slug: "compression-adaptor-f612", lines: ["EGF", "BS EN 1254-2"], x: 315, y: 214, size: 26, skewY: 6, scaleX: 0.88 },
  // The rubber hose is only ~30 px thick at the bottom of the loop, so one line.
  { file: "01_Product_Cooker_Flex.png", slug: "cooker-flex", lines: ["EGF"], x: 214, y: 604, size: 17, light: true },
  { file: "11_Product_Coupling.png", slug: "coupling", lines: ["EGF", "BS EN 12165"], x: 90, y: 455, size: 24 },
  // Batch files 04 and 05 are labelled the wrong way round (see prepare-assets.mjs), so the
  // slugs are swapped here on purpose; the label position still belongs to the photo.
  { file: "04_Product_Gas_Meter_Union_Grooved.png", slug: "gas-meter-union", lines: ["EGF", "BS 746:2014"], x: 240, y: 357, size: 21 },
  { file: "05_Product_Gas_Meter_Union.png", slug: "gas-meter-union-grooved", lines: ["EGF", "BS 746:2014"], x: 242, y: 232, size: 20 },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** SVG overlay for one label: bold "EGF" with the standard underneath, engraved look. */
function label(mark, width, height) {
  const { x, y, size, skewY = 0, scaleX = 1, light = false, lines } = mark;
  const second = size * 0.46;
  const fill = light ? "#ffffff" : "#1f1f1f";
  const opacity = light ? 0.92 : 0.8;
  const text = (dy, color, alpha) =>
    `<text x="0" y="${dy}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${size}" letter-spacing="${size * 0.06}" fill="${color}" fill-opacity="${alpha}">${esc(lines[0])}</text>` +
    (lines[1]
      ? `<text x="0" y="${dy + second * 1.35}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="${second}" letter-spacing="${second * 0.04}" fill="${color}" fill-opacity="${alpha}">${esc(lines[1])}</text>`
      : "");
  // A faint light copy one pixel below reads as the lit edge of an engraving.
  const engraved = light ? "" : text(1, "#ffffff", 0.35);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<g transform="translate(${x} ${y - size * 0.35}) skewY(${skewY}) scale(${scaleX} 1)">${engraved}${text(0, fill, opacity)}</g>` +
      `</svg>`,
  );
}

let ok = 0;
for (const mark of MARKS) {
  const src = path.join(SRC, mark.file);
  const dest = path.join(OUT, `${mark.slug}.webp`);
  try {
    const base = sharp(src, { failOn: "none" }).rotate().flatten({ background: "#ffffff" });
    const { width, height } = await base.metadata();
    await base
      .composite([{ input: label(mark, width, height), left: 0, top: 0 }])
      .webp({ quality: 88 })
      .toFile(dest);
    console.log(`${mark.slug}.webp`.padEnd(36), `${width} x ${height}`);
    ok++;
  } catch (error) {
    console.error(`FAILED ${mark.slug}: ${error.message}`);
  }
}
console.log(`\n${ok}/${MARKS.length} photos written to ${OUT}`);
