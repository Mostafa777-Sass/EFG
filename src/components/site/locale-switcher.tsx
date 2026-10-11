"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Switches between English and Arabic while staying on the current page: the
 * pathname and the query string (for example the products category filter) are
 * carried over to the other locale. Rendered only when the Arabic version is
 * enabled in the admin settings.
 */
export function LocaleSwitcher({ label, className }: { label: string; className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const other = locale === "ar" ? "en" : "ar";
  const query = Object.fromEntries(searchParams.entries());
  const short = other === "ar" ? "عربي" : "EN";
  return (
    <Link
      href={{ pathname, query }}
      locale={other}
      className={cn("btn-outline btn-sm", className)}
      lang={other}
      dir={other === "ar" ? "rtl" : "ltr"}
      aria-label={label}
    >
      <Languages className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{short}</span>
    </Link>
  );
}
