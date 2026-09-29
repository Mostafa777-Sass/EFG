import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { FormState } from "@/lib/types";
import { cn } from "@/lib/utils";

type BaseProps = {
  label: string;
  name: string;
  error?: string[];
  hint?: string;
  required?: boolean;
  className?: string;
};

export function FieldError({ error }: { error?: string[] }) {
  return error?.[0] ? <p className="field-error">{error[0]}</p> : null;
}

function Label({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="label">
      {label}
      {required && <span className="text-brand-red"> *</span>}
    </label>
  );
}

export function TextField({
  label,
  name,
  error,
  hint,
  required,
  className,
  ...input
}: BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, "name">) {
  const id = `f-${name}`;
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} required={required} />
      <input id={id} name={name} required={required} className={cn("input", Boolean(error?.length) && "border-brand-red")} {...input} />
      {hint && !error?.length && <p className="help">{hint}</p>}
      <FieldError error={error} />
    </div>
  );
}

export function TextArea({
  label,
  name,
  error,
  hint,
  required,
  className,
  rows = 4,
  ...textarea
}: BaseProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  const id = `f-${name}`;
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} required={required} />
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        className={cn("input", Boolean(error?.length) && "border-brand-red")}
        {...textarea}
      />
      {hint && !error?.length && <p className="help">{hint}</p>}
      <FieldError error={error} />
    </div>
  );
}

export function SelectField({
  label,
  name,
  error,
  hint,
  required,
  className,
  options,
  ...select
}: BaseProps & { options: Array<{ value: string; label: string }> } & Omit<SelectHTMLAttributes<HTMLSelectElement>, "name">) {
  const id = `f-${name}`;
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} required={required} />
      <select id={id} name={name} required={required} className={cn("input", Boolean(error?.length) && "border-brand-red")} {...select}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && !error?.length && <p className="help">{hint}</p>}
      <FieldError error={error} />
    </div>
  );
}

export function CheckboxField({
  label,
  name,
  hint,
  defaultChecked,
  className,
}: {
  label: string;
  name: string;
  hint?: string;
  defaultChecked?: boolean;
  className?: string;
}) {
  const id = `f-${name}`;
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 rounded border-mist-300 text-brand-red focus:ring-brand-red/40"
      />
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-navy-900">
          {label}
        </label>
        {hint && <p className="text-xs text-ink-500">{hint}</p>}
      </div>
    </div>
  );
}

export function Fieldset({ legend, description, children }: { legend: string; description?: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-mist-200 bg-white p-6">
      <legend className="px-2 text-sm font-bold uppercase tracking-[0.16em] text-navy-900">{legend}</legend>
      {description && <p className="mb-5 text-sm text-ink-500">{description}</p>}
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <div
      role="status"
      className={cn(
        "rounded-xl border px-4 py-3 text-sm font-medium",
        state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800",
      )}
    >
      {state.message}
    </div>
  );
}
