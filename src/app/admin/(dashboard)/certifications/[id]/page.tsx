import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { saveCertification } from "@/lib/actions/certifications";
import { PageHeader } from "@/components/admin/page-header";
import { CertificationForm } from "@/components/admin/certification-form";

export const metadata: Metadata = { title: "Edit certification" };

export default async function EditCertificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const certification = await prisma.certification.findUnique({ where: { id } });
  if (!certification) notFound();
  return (
    <>
      <PageHeader title={certification.nameEn} />
      <CertificationForm action={saveCertification.bind(null, certification.id)} certification={certification} />
    </>
  );
}
