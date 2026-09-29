import { cn } from "@/lib/utils";
import { FLAME_OUTER_PATH, GEAR_PATH } from "./paths";

/** Faint oversized gear/flame used as a background device on panels. */
export function Watermark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("pointer-events-none absolute", className)}
      aria-hidden="true"
      focusable="false"
    >
      <path d={GEAR_PATH} fill="currentColor" />
      <path d={FLAME_OUTER_PATH} fill="currentColor" opacity="0.6" />
    </svg>
  );
}
