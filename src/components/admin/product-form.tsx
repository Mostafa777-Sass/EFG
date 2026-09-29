"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Product } from "@prisma/client";
import { EMPTY_FORM_STATE, type FormState } from "@/lib/types";
import { CheckboxField, Fieldset, FormMessage, SelectField, TextArea, TextField } from "./fields";
import { ImageField } from "./image-field";
import { SubmitButton } from "./submit-button";
import { formDefaults } from "./form-defaults";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  product: Product | null;
  categories: Array<{ id: string; nameEn: string }>;
};

export function ProductForm({ action, product, categories }: Props) {
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);
  const e = state.errors ?? {};
  const d = formDefaults(state);

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />

      <Fieldset legend="Product">
        <TextField label="Name (English)" name="nameEn" required defaultValue={d.text("nameEn", product?.nameEn)} error={e.nameEn} />
        <TextField label="Name (Arabic)" name="nameAr" dir="rtl" defaultValue={d.text("nameAr", product?.nameAr)} error={e.nameAr} />
        <TextField
          label="URL slug"
          name="slug"
          defaultValue={d.text("slug", product?.slug)}
          dir="ltr"
          hint="Leave empty to generate from the English name. Lowercase letters, numbers and dashes."
          error={e.slug}
        />
        <SelectField
          label="Category"
          name="categoryId"
          defaultValue={d.text("categoryId", product?.categoryId)}
          options={[{ value: "", label: "No category" }, ...categories.map((c) => ({ value: c.id, label: c.nameEn }))]}
          error={e.categoryId}
        />
        <TextField label="Sizes" name="sizes" dir="ltr" defaultValue={d.text("sizes", product?.sizes)} placeholder={'e.g. 1/2" – 3/4" – 1"'} error={e.sizes} />
        <TextField label="Standard" name="standard" dir="ltr" defaultValue={d.text("standard", product?.standard)} placeholder="e.g. BS 746:2014" error={e.standard} />
        <TextField label="Material" name="material" defaultValue={d.text("material", product?.material)} placeholder="e.g. Brass CW617N" error={e.material} />
        <TextField label="Sort order" name="sortOrder" type="number" min={0} defaultValue={d.text("sortOrder", product?.sortOrder ?? 0)} hint="Lower numbers appear first." error={e.sortOrder} />
      </Fieldset>

      <Fieldset legend="Descriptions">
        <TextArea label="Short description (English)" name="shortDescriptionEn" rows={3} defaultValue={d.text("shortDescriptionEn", product?.shortDescriptionEn)} error={e.shortDescriptionEn} />
        <TextArea label="Short description (Arabic)" name="shortDescriptionAr" rows={3} dir="rtl" defaultValue={d.text("shortDescriptionAr", product?.shortDescriptionAr)} error={e.shortDescriptionAr} />
        <TextArea label="Full description (English)" name="descriptionEn" rows={7} defaultValue={d.text("descriptionEn", product?.descriptionEn)} hint="Separate paragraphs with a blank line." error={e.descriptionEn} />
        <TextArea label="Full description (Arabic)" name="descriptionAr" rows={7} dir="rtl" defaultValue={d.text("descriptionAr", product?.descriptionAr)} error={e.descriptionAr} />
      </Fieldset>

      <Fieldset legend="Photo">
        <ImageField currentUrl={product?.imageUrl} error={e.image} hint="Product on a white background works best. JPEG, PNG or WebP up to 10 MB." />
      </Fieldset>

      <Fieldset legend="Visibility">
        <CheckboxField label="Published" name="published" defaultChecked={d.checked("published", product?.published ?? true)} hint="Hidden products are not shown on the website." />
        <CheckboxField label="Featured on the home page" name="featured" defaultChecked={d.checked("featured", product?.featured ?? false)} />
      </Fieldset>

      <div className="flex flex-wrap gap-3">
        <SubmitButton label={product ? "Save changes" : "Create product"} pending={pending} />
        <Link href="/admin/products" className="btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
