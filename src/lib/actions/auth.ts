"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession, hashPassword, requireAdmin, verifyPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import type { FormState } from "@/lib/types";
import { LoginSchema, PasswordChangeSchema, fieldErrors, str } from "@/lib/validation";

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = LoginSchema.safeParse({
    email: str(formData, "email").toLowerCase(),
    password: str(formData, "password"),
    next: str(formData, "next") || undefined,
  });
  const values = { email: str(formData, "email"), next: str(formData, "next") };
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!checkRateLimit(`login:${ip}`, 8, 15 * 60_000)) {
    return { message: "Too many attempts. Please wait 15 minutes and try again.", values };
  }

  const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) return { message: "Incorrect email address or password.", values };

  await createSession(user.id);
  const next = parsed.data.next;
  redirect(next && next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = PasswordChangeSchema.safeParse({
    currentPassword: str(formData, "currentPassword"),
    newPassword: str(formData, "newPassword"),
    confirmPassword: str(formData, "confirmPassword"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const user = await prisma.adminUser.findUnique({ where: { id: admin.id } });
  if (!user || !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return { errors: { currentPassword: ["Current password is incorrect"] } };
  }
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });
  return { ok: true, message: "Password updated." };
}
