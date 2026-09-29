"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Certification } from "@prisma/client";
import { EMPTY_FORM_STATE, type FormState } from "@/lib/types";
import { CheckboxField, Fieldset, FormMessage, TextArea, TextField } from "./fields";
import { ImageField } from "./image-field";
import { SubmitButton } from "./submit-button";
import { formDefaults } from "./form-defaults";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  certification: Certification | null;
};

export function CertificationForm({ action, certification }: Props) {
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);
  const e = state.errors ?? {};
  const d = formDefaults(state);
  const c = certification;

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />

      <Fieldset legend="Certification">
        <TextField label="Name (English)" name="nameEn" required defaultValue={d.text("nameEn", c?.nameEn)} placeholder="e.g. ISO 9001:2015" error={e.nameEn} />
        <TextField label="Name (Arabic)" name="nameAr" dir="rtl" defaultValue={d.text("nameAr", c?.nameAr)} error={e.nameAr} />
        <TextField label="Issuer (English)" name="issuerEn" defaultValue={d.text("issuerEn", c?.issuerEn)} placeholder="e.g. Egyptian Organization for Standards & Quality" error={e.issuerEn} />
        <TextField label="Issuer (Arabic)" name="issuerAr" dir="rtl" defaultValue={d.text("issuerAr", c?.issuerAr)} error={e.issuerAr} />
        <TextArea label="Description (English)" name="descriptionEn" rows={3} defaultValue={d.text("descriptionEn", c?.descriptionEn)} error={e.descriptionEn} />
        <TextArea label="Description (Arabic)" name="descriptionAr" rows={3} dir="rtl" defaultValue={d.text("descriptionAr", c?.descriptionAr)} error={e.descriptionAr} />
        <TextField label="Sort order" name="sortOrder" type="number" min={0} defaultValue={d.text("sortOrder", c?.sortOrder ?? 0)} error={e.sortOrder} />
        <CheckboxField label="Published" name="published" defaultChecked={d.checked("published", c?.published ?? true)} className="md:pt-8" />
      </Fieldset>

      <Fieldset legend="Badge image">
        <ImageField label="Badge" currentUrl={c?.imageUrl} error={e.image} hint="Square badge or seal, transparent PNG preferred." />
      </Fieldset>

      <div className="flex flex-wrap gap-3">
        <SubmitButton label={c ? "Save changes" : "Add certification"} pending={pending} />
        <Link href="/admin/certifications" className="btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
