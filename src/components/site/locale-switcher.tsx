"use client";

import { useLocale } from "next-intl";
import { Languages } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ label, className }: { label: string; className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const other = locale === "ar" ? "en" : "ar";
  return (
    <Link
      href={pathname}
      locale={other}
      className={cn("inline-flex items-center gap-1.5 font-semibold hover:text-white", className)}
      lang={other}
      dir={other === "ar" ? "rtl" : "ltr"}
    >
      <Languages className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}
