"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InquiryUpdateSchema, str } from "@/lib/validation";

export async function updateInquiry(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  const parsed = InquiryUpdateSchema.safeParse({
    status: str(formData, "status"),
    notes: str(formData, "notes"),
  });
  if (!parsed.success) {
    redirect(`/admin/inquiries/${id}?error=${encodeURIComponent("Invalid status")}`);
  }
  const exists = await prisma.inquiry.findUnique({ where: { id }, select: { id: true } });
  if (!exists) redirect("/admin/inquiries?error=" + encodeURIComponent("Inquiry not found"));

  await prisma.inquiry.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin", "layout");
  redirect(`/admin/inquiries/${id}?saved=1`);
}

export async function deleteInquiry(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  await prisma.inquiry.deleteMany({ where: { id } });
  revalidatePath("/admin", "layout");
  redirect("/admin/inquiries?deleted=1");
}
