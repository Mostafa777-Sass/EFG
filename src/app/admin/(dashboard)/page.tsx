import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, Handshake, Image as ImageIcon, Inbox, Package, Tag } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [products, published, categories, clients, photos, certifications, inquiriesNew, inquiriesTotal, recent] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { published: true } }),
      prisma.category.count(),
      prisma.client.count(),
      prisma.facilityPhoto.count(),
      prisma.certification.count(),
      prisma.inquiry.count({ where: { status: "NEW" } }),
      prisma.inquiry.count(),
      prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { product: { select: { nameEn: true } } } }),
    ]);

  const cards = [
    { href: "/admin/products", label: "Products", value: `${published} / ${products}`, sub: "published / total", Icon: Package },
    { href: "/admin/categories", label: "Categories", value: String(categories), sub: "catalogue groups", Icon: Tag },
    { href: "/admin/clients", label: "Clients & partners", value: String(clients), sub: "logos shown", Icon: Handshake },
    { href: "/admin/facility", label: "Facility photos", value: String(photos), sub: "gallery images", Icon: ImageIcon },
    { href: "/admin/certifications", label: "Certifications", value: String(certifications), sub: "badges shown", Icon: Award },
    { href: "/admin/inquiries", label: "Inquiries", value: `${inquiriesNew} new`, sub: `${inquiriesTotal} total`, Icon: Inbox },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of the website content and incoming inquiries." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, label, value, sub, Icon }) => (
          <Link key={href} href={href} className="group rounded-2xl border border-mist-200 bg-white p-5 shadow-card transition-colors hover:border-navy-900/30">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mist-100 text-navy-900">
                <Icon className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-ink-300 transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="mt-4 text-2xl font-extrabold text-navy-900">{value}</p>
            <p className="text-sm font-semibold text-ink-700">{label}</p>
            <p className="text-xs text-ink-500">{sub}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-mist-200 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-mist-200 px-5 py-4">
          <h2 className="text-lg">Recent inquiries</h2>
          <Link href="/admin/inquiries" className="text-sm font-semibold text-brand-red hover:underline">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-500">No inquiries yet. Submissions from the contact form will appear here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Received</th>
                  <th>From</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {recent.map((inq) => (
                  <tr key={inq.id}>
                    <td className="whitespace-nowrap">{formatDate(inq.createdAt)}</td>
                    <td>
                      <p className="font-semibold text-navy-900">{inq.name}</p>
                      <p className="text-xs text-ink-500">{inq.company ?? inq.email}</p>
                    </td>
                    <td>{inq.product?.nameEn ?? <span className="text-ink-300">General</span>}</td>
                    <td>
                      <StatusBadge status={inq.status} />
                    </td>
                    <td className="text-end">
                      <Link href={`/admin/inquiries/${inq.id}`} className="text-sm font-semibold text-navy-900 hover:text-brand-red">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
