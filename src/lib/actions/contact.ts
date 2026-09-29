"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { sendInquiryNotification } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";
import type { FormState } from "@/lib/types";
import { InquirySchema, fieldErrors, formValues, str } from "@/lib/validation";

export async function submitInquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = InquirySchema.safeParse({
    name: str(formData, "name"),
    company: str(formData, "company"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    country: str(formData, "country"),
    subject: str(formData, "subject"),
    message: str(formData, "message"),
    productSlug: str(formData, "productSlug"),
    locale: str(formData, "locale") || "en",
    website: str(formData, "website"),
  });

  const values = formValues(formData);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error), values };
  }

  // Honeypot filled in: pretend success, store nothing.
  if (parsed.data.website) return { ok: true };

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!checkRateLimit(`inquiry:${ip}`, 5, 10 * 60_000)) {
    return { ok: false, message: "rate_limited", values };
  }

  const { productSlug, website, ...data } = parsed.data;
  void website;
  const product = productSlug
    ? await prisma.product.findUnique({ where: { slug: productSlug }, select: { id: true, nameEn: true } })
    : null;

  try {
    const inquiry = await prisma.inquiry.create({
      data: { ...data, productId: product?.id ?? null },
    });
    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { notifyEmail: true } });
    await sendInquiryNotification({ ...inquiry, productName: product?.nameEn ?? null }, settings?.notifyEmail);
  } catch (error) {
    console.error("Failed to store inquiry:", error);
    return { ok: false, message: "failed", values };
  }

  return { ok: true };
}
