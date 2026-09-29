import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-3xl">Page not found</h1>
        <Link href="/admin" className="btn-navy mt-6">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
