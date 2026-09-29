"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/types";
import { deleteUpload } from "@/lib/uploads";
import { ClientSchema, bool, fieldErrors, formValues, str } from "@/lib/validation";
import { applyImageUpload } from "./helpers";

export async function saveClient(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = ClientSchema.safeParse({
    nameEn: str(formData, "nameEn"),
    nameAr: str(formData, "nameAr"),
    type: str(formData, "type") || "DOMESTIC",
    country: str(formData, "country"),
    websiteUrl: str(formData, "websiteUrl"),
    sortOrder: str(formData, "sortOrder") || "0",
    published: bool(formData, "published"),
  });
  const values = formValues(formData);
  if (!parsed.success) {
    return { message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error), values };
  }

  const existing = id ? await prisma.client.findUnique({ where: { id } }) : null;
  if (id && !existing) return { message: "This client no longer exists.", values };

  const image = await applyImageUpload(formData, existing?.logoUrl ?? null, {
    kind: "clients",
    maxWidth: 800,
    keepAlpha: true,
  });
  if (image.error) return { message: image.error, errors: { image: [image.error] }, values };

  const payload = { ...parsed.data, logoUrl: image.url };
  if (existing) {
    await prisma.client.update({ where: { id: existing.id }, data: payload });
  } else {
    await prisma.client.create({ data: payload });
  }

  revalidatePath("/", "layout");
  redirect("/admin/clients?saved=1");
}

export async function deleteClient(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  const client = await prisma.client.findUnique({ where: { id } });
  if (client) {
    await prisma.client.delete({ where: { id } });
    await deleteUpload(client.logoUrl);
  }
  revalidatePath("/", "layout");
  redirect("/admin/clients?deleted=1");
}
