"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/types";
import { deleteUpload } from "@/lib/uploads";
import { slugify } from "@/lib/utils";
import { ProductSchema, bool, fieldErrors, formValues, str } from "@/lib/validation";
import { applyImageUpload, uniqueSlug } from "./helpers";

export async function saveProduct(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = ProductSchema.safeParse({
    nameEn: str(formData, "nameEn"),
    nameAr: str(formData, "nameAr"),
    slug: str(formData, "slug").toLowerCase(),
    categoryId: str(formData, "categoryId"),
    sizes: str(formData, "sizes"),
    standard: str(formData, "standard"),
    material: str(formData, "material"),
    shortDescriptionEn: str(formData, "shortDescriptionEn"),
    shortDescriptionAr: str(formData, "shortDescriptionAr"),
    descriptionEn: str(formData, "descriptionEn"),
    descriptionAr: str(formData, "descriptionAr"),
    featured: bool(formData, "featured"),
    published: bool(formData, "published"),
    sortOrder: str(formData, "sortOrder") || "0",
  });
  const values = formValues(formData);
  if (!parsed.success) {
    return { message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error), values };
  }

  const existing = id ? await prisma.product.findUnique({ where: { id } }) : null;
  if (id && !existing) return { message: "This product no longer exists.", values };

  const { slug: requestedSlug, categoryId, ...data } = parsed.data;
  const slug = await uniqueSlug("product", requestedSlug || slugify(data.nameEn), id);

  if (categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
    if (!category) return { message: "Selected category does not exist.", errors: { categoryId: ["Unknown category"] }, values };
  }

  const image = await applyImageUpload(formData, existing?.imageUrl ?? null, { kind: "products", maxWidth: 1200 });
  if (image.error) return { message: image.error, errors: { image: [image.error] }, values };

  const payload = { ...data, slug, categoryId: categoryId || null, imageUrl: image.url };
  if (existing) {
    await prisma.product.update({ where: { id: existing.id }, data: payload });
  } else {
    await prisma.product.create({ data: payload });
  }

  revalidatePath("/", "layout");
  redirect("/admin/products?saved=1");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  const product = await prisma.product.findUnique({ where: { id } });
  if (product) {
    await prisma.product.delete({ where: { id } });
    await deleteUpload(product.imageUrl);
  }
  revalidatePath("/", "layout");
  redirect("/admin/products?deleted=1");
}
