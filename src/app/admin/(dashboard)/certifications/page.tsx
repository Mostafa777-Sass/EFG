import type { Metadata } from "next";
import Link from "next/link";
import { Award, Plus, Trash } from "lucide-react";
import { prisma } from "@/lib/db";
import { deleteCertification } from "@/lib/actions/certifications";
import { PageHeader } from "@/components/admin/page-header";
import { Flash } from "@/components/admin/flash";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmForm } from "@/components/admin/confirm-form";

export const metadata: Metadata = { title: "Certifications" };

type Props = { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> };

export default async function CertificationsAdminPage({ searchParams }: Props) {
  const flash = await searchParams;
  const certifications = await prisma.certification.findMany({ orderBy: [{ sortOrder: "asc" }] });

  return (
    <>
      <PageHeader
        title="Certifications & approvals"
        description="Badges shown on the Quality page and the home page."
        actions={
          <Link href="/admin/certifications/new" className="btn-primary btn-sm">
            <Plus className="h-4 w-4" />
            Add certification
          </Link>
        }
      />
      <Flash {...flash} savedText="Certification saved." deletedText="Certification deleted." />

      <div className="overflow-x-auto rounded-2xl border border-mist-200 bg-white shadow-card">
        <table className="table">
          <thead>
            <tr>
              <th>Certification</th>
              <th>Issuer</th>
              <th>Status</th>
              <th>Order</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {certifications.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-ink-500">
                  No certifications yet.
                </td>
              </tr>
            )}
            {certifications.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-mist-200 bg-white p-1">
                      {c.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.imageUrl} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <Award className="h-5 w-5 text-ink-300" />
                      )}
                    </div>
                    <Link href={`/admin/certifications/${c.id}`} className="font-semibold text-navy-900 hover:text-brand-red">
                      {c.nameEn}
                    </Link>
                  </div>
                </td>
                <td>{c.issuerEn ?? "—"}</td>
                <td>
                  <StatusBadge status={c.published ? "PUBLISHED" : "DRAFT"} />
                </td>
                <td>{c.sortOrder}</td>
                <td>
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/certifications/${c.id}`} className="btn-outline btn-sm">
                      Edit
                    </Link>
                    <ConfirmForm action={deleteCertification} message={`Delete "${c.nameEn}"?`}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="btn-outline btn-sm text-brand-red hover:border-brand-red" aria-label={`Delete ${c.nameEn}`}>
                        <Trash className="h-4 w-4" />
                      </button>
                    </ConfirmForm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
