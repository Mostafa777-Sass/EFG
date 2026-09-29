"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/types";
import { SettingsSchema, bool, fieldErrors, formValues, str } from "@/lib/validation";

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = SettingsSchema.safeParse({
    companyNameEn: str(formData, "companyNameEn"),
    companyNameAr: str(formData, "companyNameAr"),
    taglineEn: str(formData, "taglineEn"),
    taglineAr: str(formData, "taglineAr"),
    phone1: str(formData, "phone1"),
    phone2: str(formData, "phone2"),
    mobile1: str(formData, "mobile1"),
    mobile2: str(formData, "mobile2"),
    fax: str(formData, "fax"),
    email: str(formData, "email"),
    whatsapp: str(formData, "whatsapp"),
    addressEn: str(formData, "addressEn"),
    addressAr: str(formData, "addressAr"),
    mapEmbedUrl: str(formData, "mapEmbedUrl"),
    foundedYear: str(formData, "foundedYear"),
    unitsProduced: str(formData, "unitsProduced"),
    unitsProducedYear: str(formData, "unitsProducedYear"),
    vatNumber: str(formData, "vatNumber"),
    standards: str(formData, "standards"),
    arabicEnabled: bool(formData, "arabicEnabled"),
    facebookUrl: str(formData, "facebookUrl"),
    linkedinUrl: str(formData, "linkedinUrl"),
    notifyEmail: str(formData, "notifyEmail"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error), values: formValues(formData) };
  }

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });

  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved." };
}
