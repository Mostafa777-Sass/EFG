import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  NEW: "bg-brand-red/10 text-brand-red",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  CLOSED: "bg-emerald-100 text-emerald-800",
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  DRAFT: "bg-mist-200 text-ink-500",
  FEATURED: "bg-navy-900/10 text-navy-900",
  DOMESTIC: "bg-navy-900/10 text-navy-900",
  EXPORT: "bg-amber-100 text-amber-800",
};

const LABELS: Record<string, string> = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  CLOSED: "Closed",
  PUBLISHED: "Published",
  DRAFT: "Hidden",
  FEATURED: "Featured",
  DOMESTIC: "Domestic",
  EXPORT: "Export",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold", STYLES[status] ?? "bg-mist-200 text-ink-700")}>
      {LABELS[status] ?? status}
    </span>
  );
}
