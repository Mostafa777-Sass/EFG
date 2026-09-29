"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/types";
import { deleteUpload } from "@/lib/uploads";
import { CertificationSchema, bool, fieldErrors, formValues, str } from "@/lib/validation";
import { applyImageUpload } from "./helpers";

export async function saveCertification(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = CertificationSchema.safeParse({
    nameEn: str(formData, "nameEn"),
    nameAr: str(formData, "nameAr"),
    issuerEn: str(formData, "issuerEn"),
    issuerAr: str(formData, "issuerAr"),
    descriptionEn: str(formData, "descriptionEn"),
    descriptionAr: str(formData, "descriptionAr"),
    sortOrder: str(formData, "sortOrder") || "0",
    published: bool(formData, "published"),
  });
  const values = formValues(formData);
  if (!parsed.success) {
    return { message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error), values };
  }

  const existing = id ? await prisma.certification.findUnique({ where: { id } }) : null;
  if (id && !existing) return { message: "This certification no longer exists.", values };

  const image = await applyImageUpload(formData, existing?.imageUrl ?? null, {
    kind: "certifications",
    maxWidth: 800,
    keepAlpha: true,
  });
  if (image.error) return { message: image.error, errors: { image: [image.error] }, values };

  const payload = { ...parsed.data, imageUrl: image.url };
  if (existing) {
    await prisma.certification.update({ where: { id: existing.id }, data: payload });
  } else {
    await prisma.certification.create({ data: payload });
  }

  revalidatePath("/", "layout");
  redirect("/admin/certifications?saved=1");
}

export async function deleteCertification(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  const cert = await prisma.certification.findUnique({ where: { id } });
  if (cert) {
    await prisma.certification.delete({ where: { id } });
    await deleteUpload(cert.imageUrl);
  }
  revalidatePath("/", "layout");
  redirect("/admin/certifications?deleted=1");
}
