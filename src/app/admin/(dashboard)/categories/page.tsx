import type { Metadata } from "next";
import { Trash } from "lucide-react";
import { prisma } from "@/lib/db";
import { deleteCategory, saveCategory } from "@/lib/actions/categories";
import { PageHeader } from "@/components/admin/page-header";
import { Flash } from "@/components/admin/flash";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { SubmitButton } from "@/components/admin/submit-button";
import { TextArea, TextField } from "@/components/admin/fields";

export const metadata: Metadata = { title: "Categories" };

type Props = { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> };

export default async function CategoriesAdminPage({ searchParams }: Props) {
  const flash = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <PageHeader title="Categories" description="Groups used to filter the product catalogue. Deleting a category keeps its products, uncategorised." />
      <Flash {...flash} savedText="Category saved." deletedText="Category deleted." />

      <section className="rounded-2xl border border-mist-200 bg-white p-6 shadow-card">
        <h2 className="text-lg">Add a category</h2>
        <form action={saveCategory} className="mt-5 grid gap-4 md:grid-cols-2">
          <TextField label="Name (English)" name="nameEn" required />
          <TextField label="Name (Arabic)" name="nameAr" dir="rtl" />
          <TextField label="URL slug" name="slug" dir="ltr" hint="Optional. Generated from the English name when empty." />
          <TextField label="Sort order" name="sortOrder" type="number" min={0} defaultValue={0} />
          <TextArea label="Description (English)" name="descriptionEn" rows={2} />
          <TextArea label="Description (Arabic)" name="descriptionAr" rows={2} dir="rtl" />
          <div className="md:col-span-2">
            <SubmitButton label="Add category" pendingLabel="Adding…" />
          </div>
        </form>
      </section>

      <div className="mt-8 space-y-4">
        {categories.length === 0 && <p className="text-sm text-ink-500">No categories yet.</p>}
        {categories.map((cat) => (
          <section key={cat.id} className="rounded-2xl border border-mist-200 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg">
                {cat.nameEn} <span className="text-sm font-normal text-ink-500">· {cat._count.products} products</span>
              </h2>
              <ConfirmForm action={deleteCategory} message={`Delete category "${cat.nameEn}"? Its products will remain, without a category.`}>
                <input type="hidden" name="id" value={cat.id} />
                <button type="submit" className="btn-outline btn-sm text-brand-red hover:border-brand-red">
                  <Trash className="h-4 w-4" />
                  Delete
                </button>
              </ConfirmForm>
            </div>
            <form action={saveCategory} className="mt-5 grid gap-4 md:grid-cols-2">
              <input type="hidden" name="id" value={cat.id} />
              <TextField label="Name (English)" name="nameEn" required defaultValue={cat.nameEn} />
              <TextField label="Name (Arabic)" name="nameAr" dir="rtl" defaultValue={cat.nameAr ?? ""} />
              <TextField label="URL slug" name="slug" dir="ltr" defaultValue={cat.slug} />
              <TextField label="Sort order" name="sortOrder" type="number" min={0} defaultValue={cat.sortOrder} />
              <TextArea label="Description (English)" name="descriptionEn" rows={2} defaultValue={cat.descriptionEn ?? ""} />
              <TextArea label="Description (Arabic)" name="descriptionAr" rows={2} dir="rtl" defaultValue={cat.descriptionAr ?? ""} />
              <div className="md:col-span-2">
                <SubmitButton label="Save" />
              </div>
            </form>
          </section>
        ))}
      </div>
    </>
  );
}
