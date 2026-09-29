import type { Metadata } from "next";
import Link from "next/link";
import { Package, Plus, Trash } from "lucide-react";
import { prisma } from "@/lib/db";
import { deleteProduct } from "@/lib/actions/products";
import { PageHeader } from "@/components/admin/page-header";
import { Flash } from "@/components/admin/flash";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmForm } from "@/components/admin/confirm-form";

export const metadata: Metadata = { title: "Products" };

type Props = { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> };

export default async function ProductsAdminPage({ searchParams }: Props) {
  const flash = await searchParams;
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
    include: { category: { select: { nameEn: true } } },
  });

  return (
    <>
      <PageHeader
        title="Products"
        description="The catalogue shown on the Products page. Featured products also appear on the home page."
        actions={
          <Link href="/admin/products/new" className="btn-primary btn-sm">
            <Plus className="h-4 w-4" />
            New product
          </Link>
        }
      />
      <Flash {...flash} savedText="Product saved." deletedText="Product deleted." />

      <div className="overflow-x-auto rounded-2xl border border-mist-200 bg-white shadow-card">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Sizes</th>
              <th>Standard</th>
              <th>Status</th>
              <th>Order</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-ink-500">
                  No products yet.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-mist-200 bg-white">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt="" className="h-full w-full object-contain p-1" />
                      ) : (
                        <Package className="h-5 w-5 text-ink-300" />
                      )}
                    </div>
                    <div>
                      <Link href={`/admin/products/${p.id}`} className="font-semibold text-navy-900 hover:text-brand-red">
                        {p.nameEn}
                      </Link>
                      <p className="text-xs text-ink-300" dir="ltr">
                        /products/{p.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td>{p.category?.nameEn ?? <span className="text-ink-300">—</span>}</td>
                <td dir="ltr">{p.sizes ?? "—"}</td>
                <td dir="ltr">{p.standard ?? "—"}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    <StatusBadge status={p.published ? "PUBLISHED" : "DRAFT"} />
                    {p.featured && <StatusBadge status="FEATURED" />}
                  </div>
                </td>
                <td>{p.sortOrder}</td>
                <td>
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/products/${p.id}`} className="btn-outline btn-sm">
                      Edit
                    </Link>
                    <ConfirmForm action={deleteProduct} message={`Delete "${p.nameEn}"? This cannot be undone.`}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="btn-outline btn-sm text-brand-red hover:border-brand-red" aria-label={`Delete ${p.nameEn}`}>
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
