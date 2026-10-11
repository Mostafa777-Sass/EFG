import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** A logo uploaded through admin Settings, served from /uploads. */
export type CustomLogo = { src: string; width: number; height: number };

/** Builds the override from the three settings columns, or null when the built-in logo applies. */
export function customLogo(url: string | null, width: number | null, height: number | null): CustomLogo | null {
  return url && width && height ? { src: url, width, height } : null;
}

type Props = {
  /**
   * "dark" (default): the logo for light backgrounds.
   * "light": the same lockup with white text, for dark panels.
   */
  variant?: "dark" | "light";
  /**
   * "horizontal" (default): mark beside the text, sized for the header bar.
   * "stacked": the lockup as supplied by EGF (mark above the text), for the footer.
   * All files are built by scripts/prepare-logo.mjs from public/images/brand/logo.jpg.
   */
  layout?: "horizontal" | "stacked";
  /** Replaces the built-in file with a logo uploaded in Settings (header or footer). */
  custom?: CustomLogo | null;
  className?: string;
};

const FILES = {
  horizontal: { dark: "/images/brand/logo-v2.webp", light: "/images/brand/logo-light-v2.webp", width: 1200, height: 400 },
  stacked: { dark: "/images/brand/logo-stacked-v2.webp", light: "/images/brand/logo-stacked-light-v2.webp", width: 900, height: 830 },
} as const;

export function Logo({ variant = "dark", layout = "horizontal", custom = null, className }: Props) {
  const dark = variant === "dark";
  const file = FILES[layout];
  // Uploaded logos are already resized WebP served by our own route, so they skip the optimizer.
  const image = custom
    ? { src: custom.src, width: custom.width, height: custom.height, unoptimized: true }
    : { src: dark ? file.dark : file.light, width: file.width, height: file.height };
  return (
    <Link href="/" className={cn("inline-flex items-center", className)} aria-label="Egypt Gas Fittings, home">
      <Image
        {...image}
        alt=""
        preload={dark}
        className={layout === "stacked" ? "h-auto w-44" : "h-14 w-auto sm:h-16"}
      />
    </Link>
  );
}
