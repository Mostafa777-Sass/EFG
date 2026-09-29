import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { saveFacilityPhoto } from "@/lib/actions/facility";
import { PageHeader } from "@/components/admin/page-header";
import { FacilityPhotoForm } from "@/components/admin/facility-photo-form";

export const metadata: Metadata = { title: "Edit photo" };

export default async function EditFacilityPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = await prisma.facilityPhoto.findUnique({ where: { id } });
  if (!photo) notFound();
  return (
    <>
      <PageHeader title={photo.titleEn} />
      <FacilityPhotoForm action={saveFacilityPhoto.bind(null, photo.id)} photo={photo} />
    </>
  );
}
