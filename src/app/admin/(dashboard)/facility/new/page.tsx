import type { Metadata } from "next";
import { saveFacilityPhoto } from "@/lib/actions/facility";
import { PageHeader } from "@/components/admin/page-header";
import { FacilityPhotoForm } from "@/components/admin/facility-photo-form";

export const metadata: Metadata = { title: "Add photo" };

export default function NewFacilityPhotoPage() {
  return (
    <>
      <PageHeader title="Add facility photo" />
      <FacilityPhotoForm action={saveFacilityPhoto.bind(null, null)} photo={null} />
    </>
  );
}
