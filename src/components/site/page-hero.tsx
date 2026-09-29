import type { ReactNode } from "react";
import { Watermark } from "@/components/brand/watermark";

type Props = {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
};

/** Page header band used on all inner pages. */
export function PageHero({ eyebrow, title, intro, children }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-mist-200 bg-mist-100">
      <Watermark className="-bottom-24 -end-10 h-80 w-80 text-navy-900/[0.045]" />
      <div className="container-x relative py-14 sm:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">{title}</h1>
        <div className="red-rule" />
        {intro && <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-500">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
