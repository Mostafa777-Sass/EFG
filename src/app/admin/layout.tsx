import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "EGF Admin", template: "%s | EGF Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-mist-100">{children}</body>
    </html>
  );
}
