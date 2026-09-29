"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FacilityPhoto } from "@prisma/client";
import { EMPTY_FORM_STATE, type FormState } from "@/lib/types";
import { CheckboxField, Fieldset, FormMessage, TextArea, TextField } from "./fields";
import { ImageField } from "./image-field";
import { SubmitButton } from "./submit-button";
import { formDefaults } from "./form-defaults";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  photo: FacilityPhoto | null;
};

export function FacilityPhotoForm({ action, photo }: Props) {
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);
  const e = state.errors ?? {};
  const d = formDefaults(state);

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />

      <Fieldset legend="Photo">
        <ImageField label="Photo" currentUrl={photo?.imageUrl} error={e.image} required={!photo} shape="wide" />
        <TextField label="Title (English)" name="titleEn" required defaultValue={d.text("titleEn", photo?.titleEn)} error={e.titleEn} />
        <TextField label="Title (Arabic)" name="titleAr" dir="rtl" defaultValue={d.text("titleAr", photo?.titleAr)} error={e.titleAr} />
        <TextArea label="Caption (English)" name="captionEn" rows={2} defaultValue={d.text("captionEn", photo?.captionEn)} error={e.captionEn} />
        <TextArea label="Caption (Arabic)" name="captionAr" rows={2} dir="rtl" defaultValue={d.text("captionAr", photo?.captionAr)} error={e.captionAr} />
        <TextField label="Sort order" name="sortOrder" type="number" min={0} defaultValue={d.text("sortOrder", photo?.sortOrder ?? 0)} error={e.sortOrder} />
        <CheckboxField label="Published" name="published" defaultChecked={d.checked("published", photo?.published ?? true)} className="md:pt-8" />
      </Fieldset>

      <div className="flex flex-wrap gap-3">
        <SubmitButton label={photo ? "Save changes" : "Add photo"} pending={pending} />
        <Link href="/admin/facility" className="btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
