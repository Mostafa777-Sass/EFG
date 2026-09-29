"use client";

import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { FieldError } from "./fields";

type Props = {
  label?: string;
  currentUrl?: string | null;
  hint?: string;
  error?: string[];
  required?: boolean;
  /** Preview box shape. */
  shape?: "square" | "wide";
};

export function ImageField({ label = "Image", currentUrl, hint, error, required, shape = "square" }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const shown = preview ?? currentUrl ?? null;

  return (
    <div className="md:col-span-2">
      <p className="label">
        {label}
        {required && <span className="text-brand-red"> *</span>}
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className={
            shape === "wide"
              ? "flex h-32 w-48 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-mist-200 bg-mist-50"
              : "flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-mist-200 bg-mist-50"
          }
        >
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="h-full w-full object-contain" />
          ) : (
            <ImagePlus className="h-8 w-8 text-ink-300" />
          )}
        </div>
        <div className="flex-1 space-y-3">
          <input
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/webp,image/avif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
            className="block w-full text-sm text-ink-700 file:me-4 file:rounded-lg file:border-0 file:bg-navy-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-navy-700"
          />
          <p className="help">{hint ?? "JPEG, PNG or WebP up to 10 MB. Converted to WebP and resized automatically."}</p>
          {currentUrl && (
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" name="removeImage" className="h-4 w-4 rounded border-mist-300" />
              Remove current image
            </label>
          )}
          <FieldError error={error} />
        </div>
      </div>
    </div>
  );
}
