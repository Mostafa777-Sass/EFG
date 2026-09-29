import type { Metadata } from "next";
import { saveCertification } from "@/lib/actions/certifications";
import { PageHeader } from "@/components/admin/page-header";
import { CertificationForm } from "@/components/admin/certification-form";

export const metadata: Metadata = { title: "Add certification" };

export default function NewCertificationPage() {
  return (
    <>
      <PageHeader title="Add certification" />
      <CertificationForm action={saveCertification.bind(null, null)} certification={null} />
    </>
  );
}
