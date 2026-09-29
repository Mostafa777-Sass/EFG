import { ArrowRight, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Watermark } from "@/components/brand/watermark";
import { telHref } from "@/lib/utils";

type Props = {
  title: string;
  text?: string;
  buttonLabel: string;
  buttonHref?: string;
  phone?: string | null;
  callLabel?: string;
};

export function CtaBand({ title, text, buttonLabel, buttonHref = "/contact", phone, callLabel }: Props) {
  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <Watermark className="-bottom-32 -end-16 h-[28rem] w-[28rem] text-white/[0.05]" />
      <div className="container-x relative flex flex-col items-start gap-8 py-16 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="h-1 w-14 rounded-full bg-brand-orange" />
          <h2 className="mt-5 text-3xl text-white sm:text-4xl">{title}</h2>
          {text && <p className="mt-4 text-lg text-white/75">{text}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={buttonHref} className="btn-primary">
            {buttonLabel}
            <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
          {phone && callLabel && (
            <a href={telHref(phone)} className="btn-ghost-light">
              <Phone className="h-4 w-4" />
              <span dir="ltr">{phone}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
