import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const newInquiries = await prisma.inquiry.count({ where: { status: "NEW" } });
  return (
    <AdminShell admin={admin} newInquiries={newInquiries}>
      {children}
    </AdminShell>
  );
}
