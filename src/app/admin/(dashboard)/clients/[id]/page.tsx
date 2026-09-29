import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { saveClient } from "@/lib/actions/clients";
import { PageHeader } from "@/components/admin/page-header";
import { ClientForm } from "@/components/admin/client-form";

export const metadata: Metadata = { title: "Edit client" };

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();
  return (
    <>
      <PageHeader title={client.nameEn} />
      <ClientForm action={saveClient.bind(null, client.id)} client={client} />
    </>
  );
}
