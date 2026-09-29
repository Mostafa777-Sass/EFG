"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/types";
import { deleteUpload } from "@/lib/uploads";
import { FacilityPhotoSchema, bool, fieldErrors, formValues, str } from "@/lib/validation";
import { applyImageUpload } from "./helpers";

export async function saveFacilityPhoto(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = FacilityPhotoSchema.safeParse({
    titleEn: str(formData, "titleEn"),
    titleAr: str(formData, "titleAr"),
    captionEn: str(formData, "captionEn"),
    captionAr: str(formData, "captionAr"),
    sortOrder: str(formData, "sortOrder") || "0",
    published: bool(formData, "published"),
  });
  const values = formValues(formData);
  if (!parsed.success) {
    return { message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error), values };
  }

  const existing = id ? await prisma.facilityPhoto.findUnique({ where: { id } }) : null;
  if (id && !existing) return { message: "This photo no longer exists.", values };

  const image = await applyImageUpload(formData, existing?.imageUrl ?? null, { kind: "facility", maxWidth: 1800 });
  if (image.error) return { message: image.error, errors: { image: [image.error] }, values };
  if (!image.url) return { message: "Please choose a photo.", errors: { image: ["A photo is required"] }, values };

  const payload = { ...parsed.data, imageUrl: image.url };
  if (existing) {
    await prisma.facilityPhoto.update({ where: { id: existing.id }, data: payload });
  } else {
    await prisma.facilityPhoto.create({ data: payload });
  }

  revalidatePath("/", "layout");
  redirect("/admin/facility?saved=1");
}

export async function deleteFacilityPhoto(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  const photo = await prisma.facilityPhoto.findUnique({ where: { id } });
  if (photo) {
    await prisma.facilityPhoto.delete({ where: { id } });
    await deleteUpload(photo.imageUrl);
  }
  revalidatePath("/", "layout");
  redirect("/admin/facility?deleted=1");
}
