"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "./locale-switcher";

export type NavItem = { href: string; label: string };

type Props = {
  items: NavItem[];
  /** Accessible name of the navigation landmark. */
  label: string;
  quoteLabel: string;
  menuLabel: string;
  closeLabel: string;
  localeLabel?: string | null;
  /** Header actions shown next to the menu button (the quote button). */
  children?: ReactNode;
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The site navigation, rendered exactly once. Below the lg breakpoint (1024px) it is a
 * panel under the sticky header that the menu button opens; from lg up the
 * same element becomes the inline link row and the button disappears.
 */
export function SiteNav({ items, label, quoteLabel, menuLabel, closeLabel, localeLabel, children }: Props) {
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
    // Close if the viewport grows past the lg breakpoint: the button is hidden
    // there, so an open panel would otherwise keep the page scroll locked.
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onDesktop = () => {
      if (desktop.matches) setOpenedAt(null);
    };
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/*
        Panel mode is positioned against the sticky header, not the viewport:
        the header's backdrop-blur makes it the containing block for fixed
        descendants, which collapsed an earlier fixed panel to zero height.
        Visibility is toggled with classes rather than the hidden attribute,
        because preflight's [hidden] rule is !important and could not be
        overridden by the lg row styles.
      */}
      <nav
        id="site-nav"
        aria-label={label}
        className={cn(
          open ? "flex" : "hidden",
          "absolute inset-x-0 top-full z-50 h-[calc(100dvh-100%)] flex-col overflow-y-auto border-t border-mist-200 bg-white px-4 py-4 sm:px-6",
          "lg:static lg:flex lg:h-auto lg:flex-row lg:items-center lg:gap-1 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0",
        )}
      >
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "border-b border-mist-100 py-3.5 text-base font-semibold transition-colors",
                "lg:rounded-md lg:border-0 lg:px-2 lg:py-2 lg:text-sm xl:px-3",
                active ? "text-brand-red" : "text-navy-900 hover:text-brand-red",
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <div className="mt-6 flex flex-col gap-3 lg:hidden">
          {/* The header shows the quote button itself from the md breakpoint up. */}
          <Link href="/contact" className="btn-primary md:hidden">
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

      <div className="flex items-center gap-3">
        {children}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-mist-200 text-navy-900 hover:bg-mist-100 lg:hidden"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? closeLabel : menuLabel}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </>
  );
}
