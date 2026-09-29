import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/logo-mark";

type Props = {
  variant?: "dark" | "light";
  idPrefix?: string;
  className?: string;
  tagline?: boolean;
};

export function Logo({ variant = "dark", idPrefix = "logo", className, tagline = true }: Props) {
  const dark = variant === "dark";
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-3", className)}
      aria-label="Egypt Gas Fittings, home"
    >
      <LogoMark className="h-11 w-11 shrink-0" idPrefix={idPrefix} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[15px] font-extrabold uppercase tracking-tight sm:text-base",
            dark ? "text-navy-900" : "text-white",
          )}
        >
          Egypt Gas Fittings
        </span>
        <span
          className={cn("mt-1 text-[13px] font-semibold", dark ? "text-navy-900" : "text-white")}
          lang="ar"
          dir="rtl"
        >
          مصر لوصلات الغاز
        </span>
        {tagline && (
          <span
            className={cn(
              "mt-1 hidden text-[9px] uppercase tracking-[0.22em] sm:block",
              dark ? "text-ink-500" : "text-white/60",
            )}
          >
            Gas fittings &amp; accessories
          </span>
        )}
      </span>
    </Link>
  );
}
