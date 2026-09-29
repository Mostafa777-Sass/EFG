"use client";

import { useActionState } from "react";
import type { SiteSettings } from "@prisma/client";
import { saveSettings } from "@/lib/actions/settings";
import { EMPTY_FORM_STATE } from "@/lib/types";
import { CheckboxField, Fieldset, FormMessage, TextArea, TextField } from "./fields";
import { SubmitButton } from "./submit-button";
import { formDefaults } from "./form-defaults";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState(saveSettings, EMPTY_FORM_STATE);
  const e = state.errors ?? {};
  const s = settings;
  // On success React resets the form to these defaults, which now come from the
  // freshly saved settings. On failure the submitted values are kept.
  const d = formDefaults(state.ok ? { ...state, values: undefined } : state);

  return (
    <form action={action} className="space-y-6">
      <FormMessage state={state} />

      <Fieldset legend="Company">
        <TextField label="Company name (English)" name="companyNameEn" required defaultValue={d.text("companyNameEn", s.companyNameEn)} error={e.companyNameEn} />
        <TextField label="Company name (Arabic)" name="companyNameAr" required dir="rtl" defaultValue={d.text("companyNameAr", s.companyNameAr)} error={e.companyNameAr} />
        <TextField label="Tagline (English)" name="taglineEn" defaultValue={d.text("taglineEn", s.taglineEn)} error={e.taglineEn} />
        <TextField label="Tagline (Arabic)" name="taglineAr" dir="rtl" defaultValue={d.text("taglineAr", s.taglineAr)} error={e.taglineAr} />
        <TextField label="Founded (year)" name="foundedYear" type="number" defaultValue={d.text("foundedYear", s.foundedYear)} error={e.foundedYear} />
        <TextField label="VAT registration number" name="vatNumber" dir="ltr" defaultValue={d.text("vatNumber", s.vatNumber)} error={e.vatNumber} />
        <TextField label="Units produced (headline figure)" name="unitsProduced" dir="ltr" defaultValue={d.text("unitsProduced", s.unitsProduced)} placeholder="e.g. 2,000,000+" error={e.unitsProduced} />
        <TextField label="Units produced in (year)" name="unitsProducedYear" type="number" defaultValue={d.text("unitsProducedYear", s.unitsProducedYear)} error={e.unitsProducedYear} />
      </Fieldset>

      <Fieldset legend="Contact details">
        <TextField label="Phone 1" name="phone1" dir="ltr" defaultValue={d.text("phone1", s.phone1)} error={e.phone1} />
        <TextField label="Phone 2" name="phone2" dir="ltr" defaultValue={d.text("phone2", s.phone2)} error={e.phone2} />
        <TextField label="Mobile 1" name="mobile1" dir="ltr" defaultValue={d.text("mobile1", s.mobile1)} error={e.mobile1} />
        <TextField label="Mobile 2" name="mobile2" dir="ltr" defaultValue={d.text("mobile2", s.mobile2)} error={e.mobile2} />
        <TextField label="Fax" name="fax" dir="ltr" defaultValue={d.text("fax", s.fax)} error={e.fax} />
        <TextField label="WhatsApp number" name="whatsapp" dir="ltr" defaultValue={d.text("whatsapp", s.whatsapp)} error={e.whatsapp} />
        <TextField label="Public email" name="email" type="email" dir="ltr" defaultValue={d.text("email", s.email)} error={e.email} />
        <TextField
          label="Send inquiry notifications to"
          name="notifyEmail"
          type="email"
          dir="ltr"
          defaultValue={d.text("notifyEmail", s.notifyEmail)}
          hint="Requires SMTP settings on the server. Inquiries are always stored in the admin regardless."
          error={e.notifyEmail}
        />
        <TextArea label="Address (English)" name="addressEn" rows={2} defaultValue={d.text("addressEn", s.addressEn)} error={e.addressEn} />
        <TextArea label="Address (Arabic)" name="addressAr" rows={2} dir="rtl" defaultValue={d.text("addressAr", s.addressAr)} error={e.addressAr} />
        <TextField
          label="Google Maps embed URL"
          name="mapEmbedUrl"
          dir="ltr"
          defaultValue={d.text("mapEmbedUrl", s.mapEmbedUrl)}
          className="md:col-span-2"
          hint='In Google Maps choose Share → Embed a map, then copy only the src="..." value.'
          error={e.mapEmbedUrl}
        />
      </Fieldset>

      <Fieldset legend="Standards" description="Shown on the Quality page and the home page. One standard per line.">
        <TextArea label="British Standards applied" name="standards" rows={7} dir="ltr" defaultValue={d.text("standards", s.standards)} className="md:col-span-2" error={e.standards} />
      </Fieldset>

      <Fieldset legend="Languages & social">
        <CheckboxField
          label="Enable the Arabic version"
          name="arabicEnabled"
          defaultChecked={d.checked("arabicEnabled", s.arabicEnabled)}
          hint="Shows the language switcher and includes /ar pages in the sitemap. Arabic fields that are empty fall back to English."
          className="md:col-span-2"
        />
        <TextField label="Facebook URL" name="facebookUrl" type="url" dir="ltr" defaultValue={d.text("facebookUrl", s.facebookUrl)} error={e.facebookUrl} />
        <TextField label="LinkedIn URL" name="linkedinUrl" type="url" dir="ltr" defaultValue={d.text("linkedinUrl", s.linkedinUrl)} error={e.linkedinUrl} />
      </Fieldset>

      <SubmitButton label="Save settings" pending={pending} />
    </form>
  );
}
