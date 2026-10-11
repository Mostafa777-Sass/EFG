import "server-only";
import { prisma } from "@/lib/db";
import { deleteUpload, fileFromForm, saveImage, UploadError, type UploadKind } from "@/lib/uploads";
import { bool } from "@/lib/validation";

/**
 * Applies an optional image upload / removal from an admin form.
 * Field names: `image` (file) and `removeImage` (checkbox) by default; with
 * `opts.field` set to e.g. `headerLogo` they become `headerLogo` and
 * `removeHeaderLogo`, so one form can carry several images.
 * `width` and `height` are only present when a new file was stored.
 */
export async function applyImageUpload(
  formData: FormData,
  current: string | null,
  opts: { kind: UploadKind; maxWidth?: number; keepAlpha?: boolean; field?: string },
): Promise<{ url: string | null; width?: number; height?: number; error?: string }> {
  const field = opts.field ?? "image";
  const removeField = `remove${field.charAt(0).toUpperCase()}${field.slice(1)}`;
  const file = fileFromForm(formData, field);
  if (file) {
    try {
      const saved = await saveImage(file, opts);
      await deleteUpload(current);
      return { url: saved.url, width: saved.width, height: saved.height };
    } catch (error) {
      return {
        url: current,
        error: error instanceof UploadError ? error.message : "Image upload failed. Please try another file.",
      };
    }
  }
  if (bool(formData, removeField) && current) {
    await deleteUpload(current);
    return { url: null };
  }
  return { url: current };
}

/** Ensures a slug is unique for products or categories, appending -2, -3 ... when needed. */
export async function uniqueSlug(
  model: "product" | "category",
  base: string,
  excludeId: string | null,
): Promise<string> {
  const root = base || "item";
  const exists = async (slug: string) => {
    const where = { slug, ...(excludeId ? { id: { not: excludeId } } : {}) };
    const row =
      model === "product"
        ? await prisma.product.findFirst({ where, select: { id: true } })
        : await prisma.category.findFirst({ where, select: { id: true } });
    return Boolean(row);
  };
  let slug = root;
  let n = 2;
  while (await exists(slug)) {
    slug = `${root}-${n++}`;
  }
  return slug;
}
