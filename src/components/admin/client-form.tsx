"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Client } from "@prisma/client";
import { EMPTY_FORM_STATE, type FormState } from "@/lib/types";
import { CheckboxField, Fieldset, FormMessage, SelectField, TextField } from "./fields";
import { ImageField } from "./image-field";
import { SubmitButton } from "./submit-button";
import { formDefaults } from "./form-defaults";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  client: Client | null;
};

export function ClientForm({ action, client }: Props) {
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);
  const e = state.errors ?? {};
  const d = formDefaults(state);

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />

      <Fieldset legend="Client / partner">
        <TextField label="Name (English)" name="nameEn" required defaultValue={d.text("nameEn", client?.nameEn)} error={e.nameEn} />
        <TextField label="Name (Arabic)" name="nameAr" dir="rtl" defaultValue={d.text("nameAr", client?.nameAr)} error={e.nameAr} />
        <SelectField
          label="Type"
          name="type"
          defaultValue={d.text("type", client?.type ?? "DOMESTIC")}
          options={[
            { value: "DOMESTIC", label: "Domestic distribution partner" },
            { value: "EXPORT", label: "Export market" },
          ]}
          error={e.type}
        />
        <TextField label="Country" name="country" defaultValue={d.text("country", client?.country)} placeholder="e.g. Egypt, UAE" error={e.country} />
        <TextField label="Website" name="websiteUrl" type="url" dir="ltr" defaultValue={d.text("websiteUrl", client?.websiteUrl)} placeholder="https://" error={e.websiteUrl} />
        <TextField label="Sort order" name="sortOrder" type="number" min={0} defaultValue={d.text("sortOrder", client?.sortOrder ?? 0)} error={e.sortOrder} />
      </Fieldset>

      <Fieldset legend="Logo">
        <ImageField label="Logo" currentUrl={client?.logoUrl} error={e.image} hint="Transparent PNG preferred. Transparency is kept." shape="wide" />
      </Fieldset>

      <Fieldset legend="Visibility">
        <CheckboxField label="Published" name="published" defaultChecked={d.checked("published", client?.published ?? true)} />
      </Fieldset>

      <div className="flex flex-wrap gap-3">
        <SubmitButton label={client ? "Save changes" : "Add client"} pending={pending} />
        <Link href="/admin/clients" className="btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
