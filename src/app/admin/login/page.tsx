import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentAdmin()) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-mist-200 bg-white p-8 shadow-card">
          <div className="flex items-center gap-3">
            <Image src="/images/brand/logo-mark.webp" alt="" width={48} height={48} className="h-12 w-12 shrink-0" />
            <div className="leading-tight">
              <p className="text-base font-extrabold uppercase tracking-tight text-navy-900">Egypt Gas Fittings</p>
              <p className="text-xs text-ink-500">Website administration</p>
            </div>
          </div>
          <h1 className="mt-8 text-2xl">Sign in</h1>
          <p className="mt-1 text-sm text-ink-500">Use your administrator account to manage the website.</p>
          <div className="mt-6">
            <LoginForm next={next} />
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-ink-500">
          <Link href="/" className="hover:text-navy-900">
            ← Back to the public website
          </Link>
        </p>
      </div>
    </div>
  );
}
