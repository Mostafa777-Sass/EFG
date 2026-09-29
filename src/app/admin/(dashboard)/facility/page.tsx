import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Trash } from "lucide-react";
import { prisma } from "@/lib/db";
import { deleteFacilityPhoto } from "@/lib/actions/facility";
import { PageHeader } from "@/components/admin/page-header";
import { Flash } from "@/components/admin/flash";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmForm } from "@/components/admin/confirm-form";

export const metadata: Metadata = { title: "Facility photos" };

type Props = { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> };

export default async function FacilityAdminPage({ searchParams }: Props) {
  const flash = await searchParams;
  const photos = await prisma.facilityPhoto.findMany({ orderBy: [{ sortOrder: "asc" }] });

  return (
    <>
      <PageHeader
        title="Facility photos"
        description="Gallery on the Facility page. The first three published photos also appear on the home page."
        actions={
          <Link href="/admin/facility/new" className="btn-primary btn-sm">
            <Plus className="h-4 w-4" />
            Add photo
          </Link>
        }
      />
      <Flash {...flash} savedText="Photo saved." deletedText="Photo deleted." />

      {photos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-mist-300 p-10 text-center text-sm text-ink-500">No photos yet.</p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <li key={p.id} className="overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-card">
              <div className="aspect-[4/3] bg-mist-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy-900">{p.titleEn}</p>
                    {p.captionEn && <p className="text-xs text-ink-500">{p.captionEn}</p>}
                  </div>
                  <StatusBadge status={p.published ? "PUBLISHED" : "DRAFT"} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-ink-300">Order {p.sortOrder}</span>
                  <div className="flex gap-2">
                    <Link href={`/admin/facility/${p.id}`} className="btn-outline btn-sm">
                      Edit
                    </Link>
                    <ConfirmForm action={deleteFacilityPhoto} message={`Delete "${p.titleEn}"?`}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="btn-outline btn-sm text-brand-red hover:border-brand-red" aria-label={`Delete ${p.titleEn}`}>
                        <Trash className="h-4 w-4" />
                      </button>
                    </ConfirmForm>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
