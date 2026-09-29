"use client";

import { useActionState } from "react";
import { CircleCheck, Send } from "lucide-react";
import { submitInquiry } from "@/lib/actions/contact";
import { EMPTY_FORM_STATE } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ContactFormLabels = {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  product: string;
  productNone: string;
  subject: string;
  message: string;
  send: string;
  sending: string;
  successTitle: string;
  success: string;
  sendAnother: string;
  error: string;
  required: string;
};

type ProductOption = { slug: string; name: string };

type Props = {
  labels: ContactFormLabels;
  products: ProductOption[];
  defaultProductSlug?: string;
  locale: string;
};

export function ContactForm({ labels, products, defaultProductSlug, locale }: Props) {
  const [state, action, pending] = useActionState(submitInquiry, EMPTY_FORM_STATE);
  const errors = state.errors ?? {};
  // A failed submission keeps what the visitor typed (React resets the form after every action).
  const v = state.values ?? {};

  if (state.ok) {
    return (
      <div className="card-white text-center">
        <CircleCheck className="mx-auto h-12 w-12 text-emerald-600" />
        <h3 className="mt-4 text-2xl">{labels.successTitle}</h3>
        <p className="mt-2 text-ink-500">{labels.success}</p>
        <a href="" className="btn-outline mt-6">
          {labels.sendAnother}
        </a>
      </div>
    );
  }

  const field = (name: string) => (
    errors[name]?.[0] ? <p className="field-error">{errors[name]?.[0]}</p> : null
  );

  return (
    <form action={action} className="card-white relative space-y-5" noValidate>
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot, hidden from real users */}
      <div className="absolute -start-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="label">
            {labels.name} <span className="text-brand-red">*</span>
          </label>
          <input id="cf-name" name="name" className={cn("input", errors.name && "border-brand-red")} required autoComplete="name" defaultValue={v.name ?? ""} />
          {field("name")}
        </div>
        <div>
          <label htmlFor="cf-company" className="label">{labels.company}</label>
          <input id="cf-company" name="company" className="input" autoComplete="organization" defaultValue={v.company ?? ""} />
        </div>
        <div>
          <label htmlFor="cf-email" className="label">
            {labels.email} <span className="text-brand-red">*</span>
          </label>
          <input id="cf-email" name="email" type="email" className={cn("input", errors.email && "border-brand-red")} required autoComplete="email" dir="ltr" defaultValue={v.email ?? ""} />
          {field("email")}
        </div>
        <div>
          <label htmlFor="cf-phone" className="label">{labels.phone}</label>
          <input id="cf-phone" name="phone" type="tel" className="input" autoComplete="tel" dir="ltr" defaultValue={v.phone ?? ""} />
        </div>
        <div>
          <label htmlFor="cf-country" className="label">{labels.country}</label>
          <input id="cf-country" name="country" className="input" autoComplete="country-name" defaultValue={v.country ?? ""} />
        </div>
        <div>
          <label htmlFor="cf-product" className="label">{labels.product}</label>
          <select id="cf-product" name="productSlug" className="input" defaultValue={v.productSlug ?? defaultProductSlug ?? ""}>
            <option value="">{labels.productNone}</option>
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="cf-subject" className="label">{labels.subject}</label>
        <input id="cf-subject" name="subject" className="input" defaultValue={v.subject ?? ""} />
      </div>

      <div>
        <label htmlFor="cf-message" className="label">
          {labels.message} <span className="text-brand-red">*</span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={6}
          className={cn("input", errors.message && "border-brand-red")}
          required
          defaultValue={v.message ?? ""}
        />
        {field("message")}
      </div>

      {state.ok === false && state.message && <p className="field-error text-sm">{labels.error}</p>}

      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
        <Send className="h-4 w-4 rtl:-scale-x-100" />
        {pending ? labels.sending : labels.send}
      </button>
      <p className="text-xs text-ink-300">
        <span className="text-brand-red">*</span> {labels.required}
      </p>
    </form>
  );
}
