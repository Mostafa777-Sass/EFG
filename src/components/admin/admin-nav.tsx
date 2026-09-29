"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  FileText,
  Handshake,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Package,
  Settings,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/categories", label: "Categories", Icon: Tag },
  { href: "/admin/clients", label: "Clients & partners", Icon: Handshake },
  { href: "/admin/facility", label: "Facility photos", Icon: ImageIcon },
  { href: "/admin/certifications", label: "Certifications", Icon: Award },
  { href: "/admin/inquiries", label: "Inquiries", Icon: Inbox },
  { href: "/admin/content", label: "Page content", Icon: FileText },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export function AdminNav({ newInquiries }: { newInquiries: number }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:p-4" aria-label="Admin">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
              active ? "bg-navy-900 text-white" : "text-ink-700 hover:bg-mist-100 hover:text-navy-900",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
            {href === "/admin/inquiries" && newInquiries > 0 && (
              <span
                className={cn(
                  "ms-auto rounded-full px-2 py-0.5 text-[11px] font-bold",
                  active ? "bg-white/20 text-white" : "bg-brand-red text-white",
                )}
              >
                {newInquiries}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
