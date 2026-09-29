import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash } from "lucide-react";
import { prisma } from "@/lib/db";
import { deleteInquiry, updateInquiry } from "@/lib/actions/inquiries";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { Flash } from "@/components/admin/flash";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { SubmitButton } from "@/components/admin/submit-button";
import { SelectField, TextArea } from "@/components/admin/fields";

export const metadata: Metadata = { title: "Inquiry" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> };

export default async function InquiryDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const flash = await searchParams;
  const inquiry = await prisma.inquiry.findUnique({ where: { id }, include: { product: { select: { nameEn: true, slug: true } } } });
  if (!inquiry) notFound();

  const details: Array<[string, React.ReactNode]> = [
    ["Received", formatDate(inquiry.createdAt)],
    ["Name", inquiry.name],
    ["Company", inquiry.company ?? "—"],
    ["Email", <a key="email" href={`mailto:${inquiry.email}`} className="text-navy-900 hover:text-brand-red" dir="ltr">{inquiry.email}</a>],
    ["Phone", inquiry.phone ? <a key="phone" href={`tel:${inquiry.phone}`} className="text-navy-900 hover:text-brand-red" dir="ltr">{inquiry.phone}</a> : "—"],
    ["Country", inquiry.country ?? "—"],
    ["Product", inquiry.product ? <Link key="product" href={`/products/${inquiry.product.slug}`} target="_blank" className="text-navy-900 hover:text-brand-red">{inquiry.product.nameEn}</Link> : "General inquiry"],
    ["Subject", inquiry.subject ?? "—"],
    ["Language", inquiry.locale.toUpperCase()],
  ];

  return (
    <>
      <Link href="/admin/inquiries" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" />
        All inquiries
      </Link>
      <PageHeader title={`Inquiry from ${inquiry.name}`} actions={<StatusBadge status={inquiry.status} />} />
      <Flash {...flash} savedText="Inquiry updated." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-mist-200 bg-white p-6 shadow-card">
            <dl className="grid gap-4 sm:grid-cols-2">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-bold uppercase tracking-wider text-ink-300">{label}</dt>
                  <dd className="mt-0.5 text-sm text-ink-700">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="rounded-2xl border border-mist-200 bg-white p-6 shadow-card">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-300">Message</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">{inquiry.message}</p>
          </section>
        </div>

        <div className="space-y-6">
          <form action={updateInquiry} className="space-y-4 rounded-2xl border border-mist-200 bg-white p-6 shadow-card">
            <input type="hidden" name="id" value={inquiry.id} />
            <SelectField
              label="Status"
              name="status"
              defaultValue={inquiry.status}
              options={[
                { value: "NEW", label: "New" },
                { value: "IN_PROGRESS", label: "In progress" },
                { value: "CLOSED", label: "Closed" },
              ]}
            />
            <TextArea label="Internal notes" name="notes" rows={5} defaultValue={inquiry.notes ?? ""} hint="Only visible in the admin." />
            <SubmitButton label="Save" className="w-full" />
          </form>
          <ConfirmForm action={deleteInquiry} message="Delete this inquiry permanently?">
            <input type="hidden" name="id" value={inquiry.id} />
            <button type="submit" className="btn-outline w-full text-brand-red hover:border-brand-red">
              <Trash className="h-4 w-4" />
              Delete inquiry
            </button>
          </ConfirmForm>
        </div>
      </div>
    </>
  );
}
