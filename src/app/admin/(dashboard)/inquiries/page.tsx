import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { INQUIRY_STATUSES } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { Flash } from "@/components/admin/flash";
import { StatusBadge } from "@/components/admin/status-badge";

export const metadata: Metadata = { title: "Inquiries" };

type Props = { searchParams: Promise<{ status?: string; deleted?: string; error?: string }> };

const TABS = [
  { value: "", label: "All" },
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "CLOSED", label: "Closed" },
];

export default async function InquiriesAdminPage({ searchParams }: Props) {
  const { status, deleted, error } = await searchParams;
  const active = INQUIRY_STATUSES.includes(status as (typeof INQUIRY_STATUSES)[number]) ? status : "";

  const [inquiries, counts] = await Promise.all([
    prisma.inquiry.findMany({
      where: active ? { status: active } : undefined,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { nameEn: true } } },
    }),
    prisma.inquiry.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const countFor = (value: string) =>
    value ? (counts.find((c) => c.status === value)?._count._all ?? 0) : counts.reduce((sum, c) => sum + c._count._all, 0);

  return (
    <>
      <PageHeader title="Inquiries" description="Messages sent through the contact form." />
      <Flash deleted={deleted} error={error} deletedText="Inquiry deleted." />

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/inquiries?status=${tab.value}` : "/admin/inquiries"}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold",
              active === tab.value ? "border-navy-900 bg-navy-900 text-white" : "border-mist-300 bg-white text-navy-900 hover:border-navy-900",
            )}
          >
            {tab.label} <span className={active === tab.value ? "text-white/70" : "text-ink-300"}>{countFor(tab.value)}</span>
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-mist-200 bg-white shadow-card">
        <table className="table">
          <thead>
            <tr>
              <th>Received</th>
              <th>From</th>
              <th>Product / subject</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-ink-500">
                  No inquiries here.
                </td>
              </tr>
            )}
            {inquiries.map((inq) => (
              <tr key={inq.id}>
                <td className="whitespace-nowrap">{formatDate(inq.createdAt)}</td>
                <td>
                  <Link href={`/admin/inquiries/${inq.id}`} className="font-semibold text-navy-900 hover:text-brand-red">
                    {inq.name}
                  </Link>
                  <p className="text-xs text-ink-500">
                    {inq.company ? `${inq.company} · ` : ""}
                    <span dir="ltr">{inq.email}</span>
                  </p>
                </td>
                <td>
                  <p>{inq.product?.nameEn ?? <span className="text-ink-300">General inquiry</span>}</p>
                  {inq.subject && <p className="text-xs text-ink-500">{inq.subject}</p>}
                </td>
                <td>
                  <StatusBadge status={inq.status} />
                </td>
                <td className="text-end">
                  <Link href={`/admin/inquiries/${inq.id}`} className="btn-outline btn-sm">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
