import type { Metadata } from "next";
import { saveClient } from "@/lib/actions/clients";
import { PageHeader } from "@/components/admin/page-header";
import { ClientForm } from "@/components/admin/client-form";

export const metadata: Metadata = { title: "New client" };

export default function NewClientPage() {
  return (
    <>
      <PageHeader title="New client or partner" />
      <ClientForm action={saveClient.bind(null, null)} client={null} />
    </>
  );
}
