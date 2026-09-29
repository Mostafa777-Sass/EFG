import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { saveProduct } from "@/lib/actions/products";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }], select: { id: true, nameEn: true } });
  return (
    <>
      <PageHeader title="New product" />
      <ProductForm action={saveProduct.bind(null, null)} product={null} categories={categories} />
    </>
  );
}
