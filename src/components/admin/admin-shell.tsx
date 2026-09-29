import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import type { AdminIdentity } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { LogoMark } from "@/components/brand/logo-mark";
import { AdminNav } from "./admin-nav";

type Props = { admin: AdminIdentity; newInquiries: number; children: ReactNode };

export function AdminShell({ admin, newInquiries, children }: Props) {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-mist-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-e">
        <div className="flex items-center gap-3 border-b border-mist-200 px-5 py-4">
          <LogoMark className="h-9 w-9" idPrefix="adm" />
          <div className="leading-tight">
            <p className="text-sm font-extrabold uppercase tracking-tight text-navy-900">EGF Admin</p>
            <p className="text-[11px] text-ink-500">Egypt Gas Fittings</p>
          </div>
        </div>
        <AdminNav newInquiries={newInquiries} />
        <div className="mt-auto hidden border-t border-mist-200 p-4 lg:block">
          <Link href="/" target="_blank" className="flex items-center gap-2 text-xs font-semibold text-ink-500 hover:text-navy-900">
            <ExternalLink className="h-3.5 w-3.5" />
            View public site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-mist-200 bg-white px-6 py-3">
          <p className="truncate text-sm text-ink-500">
            Signed in as <span className="font-semibold text-navy-900">{admin.name}</span>
            <span className="hidden sm:inline"> ({admin.email})</span>
          </p>
          <form action={logout}>
            <button type="submit" className="btn-outline btn-sm">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </header>
        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
