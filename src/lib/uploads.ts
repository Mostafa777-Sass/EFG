import "server-only";
import path from "node:path";
import fs from "node:fs/promises";
import { randomBytes } from "node:crypto";
import sharp from "sharp";

// The ignore hints stop Turbopack from tracing the whole project into the
// standalone output because of these runtime-configured paths.
export const UPLOAD_DIR = path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR ?? "./data/uploads");
export const UPLOAD_URL_PREFIX = "/uploads/";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 10 * 1024 * 1024;

export type UploadKind = "products" | "clients" | "facility" | "certifications" | "general";

export class UploadError extends Error {}

/**
 * Validates, resizes and converts an uploaded image to WebP, then stores it
 * under UPLOAD_DIR. Returns the public URL (/uploads/...).
 */
export async function saveImage(
  file: File,
  opts: { kind: UploadKind; maxWidth?: number; keepAlpha?: boolean },
): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UploadError("Only JPEG, PNG, WebP or AVIF images are accepted.");
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError("Image is larger than 10 MB.");
  }

  const input = Buffer.from(await file.arrayBuffer());
  const max = opts.maxWidth ?? 1600;

  let pipeline = sharp(input, { failOn: "none" }).rotate().resize({
    width: max,
    height: max,
    fit: "inside",
    withoutEnlargement: true,
  });
  if (!opts.keepAlpha) pipeline = pipeline.flatten({ background: "#ffffff" });
  const output = await pipeline.webp({ quality: 85 }).toBuffer();

  const year = String(new Date().getFullYear());
  const name = `${randomBytes(8).toString("hex")}.webp`;
  const relDir = path.join(opts.kind, year);
  const dir = path.join(/* turbopackIgnore: true */ UPLOAD_DIR, relDir);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(/* turbopackIgnore: true */ dir, name), output);

  return `${UPLOAD_URL_PREFIX}${opts.kind}/${year}/${name}`;
}

/** Deletes a previously uploaded file. Ignores static /images/ assets and missing files. */
export async function deleteUpload(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith(UPLOAD_URL_PREFIX)) return;
  const rel = url.slice(UPLOAD_URL_PREFIX.length);
  const abs = resolveUploadPath(rel);
  if (!abs) return;
  try {
    await fs.unlink(abs);
  } catch {
    // already gone
  }
}

/** Resolves a relative upload path safely inside UPLOAD_DIR, or null if it escapes. */
export function resolveUploadPath(rel: string): string | null {
  const segments = rel.split("/");
  if (segments.some((s) => s === "" || s === "." || s === ".." || s.includes("\\"))) {
    return null;
  }
  const abs = path.resolve(/* turbopackIgnore: true */ UPLOAD_DIR, ...segments);
  if (abs !== UPLOAD_DIR && !abs.startsWith(UPLOAD_DIR + path.sep)) return null;
  return abs;
}

/** Reads an uploaded File field from a form; returns null when nothing was selected. */
export function fileFromForm(formData: FormData, field: string): File | null {
  const value = formData.get(field);
  if (value instanceof File && value.size > 0 && value.name) return value;
  return null;
}
