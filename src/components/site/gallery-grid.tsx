"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";

export type GalleryPhoto = { id: string; src: string; title: string; caption?: string | null };

type Props = { photos: GalleryPhoto[]; viewLabel: string; closeLabel: string };

export function GalleryGrid({ photos, viewLabel, closeLabel }: Props) {
  const [active, setActive] = useState<GalleryPhoto | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active && !dialog.open) dialog.showModal();
    if (!active && dialog.open) dialog.close();
  }, [active]);

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setActive(photo)}
              className="group block w-full overflow-hidden rounded-2xl border border-mist-200 bg-white text-start shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40"
              aria-label={`${viewLabel}: ${photo.title}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-mist-100">
                <AppImage
                  src={photo.src}
                  alt={photo.title}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="font-bold text-navy-900">{photo.title}</p>
                {photo.caption && <p className="mt-1 text-sm text-ink-500">{photo.caption}</p>}
              </div>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setActive(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setActive(null);
        }}
        className="m-auto w-[min(96vw,64rem)] rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-navy-950/80"
      >
        {active && (
          <div>
            <div className="relative aspect-[4/3] bg-mist-100">
              <AppImage src={active.src} alt={active.title} fill sizes="96vw" className="object-contain" />
            </div>
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="font-bold text-navy-900">{active.title}</p>
                {active.caption && <p className="mt-1 text-sm text-ink-500">{active.caption}</p>}
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-mist-200 text-navy-900 hover:bg-mist-100"
                aria-label={closeLabel}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
