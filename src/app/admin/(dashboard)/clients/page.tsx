import type { Metadata } from "next";
import Link from "next/link";
import { Handshake, Plus, Trash } from "lucide-react";
import { prisma } from "@/lib/db";
import { deleteClient } from "@/lib/actions/clients";
import { PageHeader } from "@/components/admin/page-header";
import { Flash } from "@/components/admin/flash";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmForm } from "@/components/admin/confirm-form";

export const metadata: Metadata = { title: "Clients & partners" };

type Props = { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> };

export default async function ClientsAdminPage({ searchParams }: Props) {
  const flash = await searchParams;
  const clients = await prisma.client.findMany({ orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }] });

  return (
    <>
      <PageHeader
        title="Clients & partners"
        description="Logos shown on the Clients page and the home page logo band."
        actions={
          <Link href="/admin/clients/new" className="btn-primary btn-sm">
            <Plus className="h-4 w-4" />
            New client
          </Link>
        }
      />
      <Flash {...flash} savedText="Client saved." deletedText="Client deleted." />

      <div className="overflow-x-auto rounded-2xl border border-mist-200 bg-white shadow-card">
        <table className="table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Type</th>
              <th>Country</th>
              <th>Status</th>
              <th>Order</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-ink-500">
                  No clients yet.
                </td>
              </tr>
            )}
            {clients.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-mist-200 bg-white p-1">
                      {c.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.logoUrl} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <Handshake className="h-5 w-5 text-ink-300" />
                      )}
                    </div>
                    <Link href={`/admin/clients/${c.id}`} className="font-semibold text-navy-900 hover:text-brand-red">
                      {c.nameEn}
                    </Link>
                  </div>
                </td>
                <td>
                  <StatusBadge status={c.type} />
                </td>
                <td>{c.country ?? "—"}</td>
                <td>
                  <StatusBadge status={c.published ? "PUBLISHED" : "DRAFT"} />
                </td>
                <td>{c.sortOrder}</td>
                <td>
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/clients/${c.id}`} className="btn-outline btn-sm">
                      Edit
                    </Link>
                    <ConfirmForm action={deleteClient} message={`Delete "${c.nameEn}"?`}>
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
