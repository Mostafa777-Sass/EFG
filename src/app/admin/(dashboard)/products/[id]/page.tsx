import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { saveProduct } from "@/lib/actions/products";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }], select: { id: true, nameEn: true } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <PageHeader
        title={product.nameEn}
        description="Edit product details, photo and visibility."
        actions={
          <Link href={`/products/${product.slug}`} target="_blank" className="btn-outline btn-sm">
            <ExternalLink className="h-4 w-4" />
            View on site
          </Link>
        }
      />
      <ProductForm action={saveProduct.bind(null, product.id)} product={product} categories={categories} />
    </>
  );
}
