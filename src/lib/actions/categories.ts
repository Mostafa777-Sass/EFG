"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { CategorySchema, str } from "@/lib/validation";
import { uniqueSlug } from "./helpers";

function back(params: Record<string, string>): never {
  const query = new URLSearchParams(params).toString();
  redirect(`/admin/categories${query ? `?${query}` : ""}`);
}

export async function saveCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id") || null;

  const parsed = CategorySchema.safeParse({
    nameEn: str(formData, "nameEn"),
    nameAr: str(formData, "nameAr"),
    slug: str(formData, "slug").toLowerCase(),
    descriptionEn: str(formData, "descriptionEn"),
    descriptionAr: str(formData, "descriptionAr"),
    sortOrder: str(formData, "sortOrder") || "0",
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    back({ error: `${first.path.join(".")}: ${first.message}` });
  }

  const { slug: requestedSlug, ...data } = parsed.data;
  const slug = await uniqueSlug("category", requestedSlug || slugify(data.nameEn), id);

  if (id) {
    const exists = await prisma.category.findUnique({ where: { id }, select: { id: true } });
    if (!exists) back({ error: "Category not found." });
    await prisma.category.update({ where: { id }, data: { ...data, slug } });
  } else {
    await prisma.category.create({ data: { ...data, slug } });
  }

  revalidatePath("/", "layout");
  back({ saved: "1" });
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  // Products keep existing; their categoryId becomes null (onDelete: SetNull).
  await prisma.category.deleteMany({ where: { id } });
  revalidatePath("/", "layout");
  back({ deleted: "1" });
}
