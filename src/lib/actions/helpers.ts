import "server-only";
import { prisma } from "@/lib/db";
import { deleteUpload, fileFromForm, saveImage, UploadError, type UploadKind } from "@/lib/uploads";
import { bool } from "@/lib/validation";

/**
 * Applies an optional image upload / removal from an admin form.
 * Field names: `image` (file) and `removeImage` (checkbox).
 */
export async function applyImageUpload(
  formData: FormData,
  current: string | null,
  opts: { kind: UploadKind; maxWidth?: number; keepAlpha?: boolean },
): Promise<{ url: string | null; error?: string }> {
  const file = fileFromForm(formData, "image");
  if (file) {
    try {
      const url = await saveImage(file, opts);
      await deleteUpload(current);
      return { url };
    } catch (error) {
      return {
        url: current,
        error: error instanceof UploadError ? error.message : "Image upload failed. Please try another file.",
      };
    }
  }
  if (bool(formData, "removeImage") && current) {
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
