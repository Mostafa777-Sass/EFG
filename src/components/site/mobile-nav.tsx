"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { isActivePath, type NavItem } from "./nav-links";
import { LocaleSwitcher } from "./locale-switcher";

type Props = {
  items: NavItem[];
  quoteLabel: string;
  menuLabel: string;
  closeLabel: string;
  localeLabel?: string | null;
};

export function MobileNav({ items, quoteLabel, menuLabel, closeLabel, localeLabel }: Props) {
  const pathname = usePathname();
  // The panel is only open for the pathname it was opened on, so any
  // navigation closes it without an effect.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = (value: boolean) => setOpenedAt(value ? pathname : null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenedAt(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-mist-200 text-navy-900 hover:bg-mist-100"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? closeLabel : menuLabel}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-x-0 top-20 bottom-0 z-50 overflow-y-auto border-t border-mist-200 bg-white"
      >
        <nav className="container-x flex flex-col py-4" aria-label="Mobile">
          {items.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "border-b border-mist-100 py-3.5 text-base font-semibold",
                  active ? "text-brand-red" : "text-navy-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/contact" className="btn-primary">
              {quoteLabel}
            </Link>
            {localeLabel && (
              <LocaleSwitcher
                label={localeLabel}
                className="justify-center rounded-lg border border-mist-200 py-3 text-navy-900 hover:text-navy-900"
              />
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
