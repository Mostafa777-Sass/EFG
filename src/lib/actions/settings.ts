"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/types";
import { SettingsSchema, bool, fieldErrors, formValues, str } from "@/lib/validation";
import { applyImageUpload } from "./helpers";

type LogoColumns = { url: string | null; width: number | null; height: number | null };

/** Resolves the stored logo columns from an upload result: new file, removal, or unchanged. */
function logoColumns(result: Awaited<ReturnType<typeof applyImageUpload>>, current: LogoColumns): LogoColumns {
  if (result.url === null) return { url: null, width: null, height: null };
  if (result.width && result.height) return { url: result.url, width: result.width, height: result.height };
  return { url: result.url, width: current.width, height: current.height };
}

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

  // Header and footer logos: uploaded files replace the built-in logo; "remove" goes back to it.
  const current = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const header = await applyImageUpload(formData, current?.headerLogoUrl ?? null, {
    kind: "brand",
    maxWidth: 1600,
    keepAlpha: true,
    field: "headerLogo",
  });
  if (header.error) return { ok: false, message: header.error, errors: { headerLogo: [header.error] }, values: formValues(formData) };
  const footer = await applyImageUpload(formData, current?.footerLogoUrl ?? null, {
    kind: "brand",
    maxWidth: 1200,
    keepAlpha: true,
    field: "footerLogo",
  });
  if (footer.error) return { ok: false, message: footer.error, errors: { footerLogo: [footer.error] }, values: formValues(formData) };

  const h = logoColumns(header, { url: current?.headerLogoUrl ?? null, width: current?.headerLogoWidth ?? null, height: current?.headerLogoHeight ?? null });
  const f = logoColumns(footer, { url: current?.footerLogoUrl ?? null, width: current?.footerLogoWidth ?? null, height: current?.footerLogoHeight ?? null });
  const logos = {
    headerLogoUrl: h.url,
    headerLogoWidth: h.width,
    headerLogoHeight: h.height,
    footerLogoUrl: f.url,
    footerLogoWidth: f.width,
    footerLogoHeight: f.height,
  };

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { ...parsed.data, ...logos },
    create: { id: 1, ...parsed.data, ...logos },
  });

  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved." };
}
