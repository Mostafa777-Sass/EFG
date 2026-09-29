"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/types";
import { formValues } from "@/lib/validation";

export async function saveContentBlocks(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const blocks = await prisma.contentBlock.findMany();
  const errors: Record<string, string[]> = {};
  const updates = [];

  for (const block of blocks) {
    const en = formData.get(`en:${block.key}`);
    const ar = formData.get(`ar:${block.key}`);
    if (typeof en !== "string" && typeof ar !== "string") continue;

    const textEn = typeof en === "string" ? en.trim() : block.textEn;
    const textAr = typeof ar === "string" ? ar.trim() : (block.textAr ?? "");
    if (!textEn) {
      errors[`en:${block.key}`] = ["English text is required"];
      continue;
    }
    if (textEn.length > 5000 || textAr.length > 5000) {
      errors[`en:${block.key}`] = ["Text is too long (max 5000 characters)"];
      continue;
    }
    updates.push(
      prisma.contentBlock.update({
        where: { key: block.key },
        data: { textEn, textAr: textAr.length ? textAr : null },
      }),
    );
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Some blocks could not be saved.", errors, values: formValues(formData) };
  }

  await prisma.$transaction(updates);
  revalidatePath("/", "layout");
  return { ok: true, message: "Content saved." };
}
