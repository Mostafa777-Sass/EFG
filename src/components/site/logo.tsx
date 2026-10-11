import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

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
  className?: string;
};

const FILES = {
  horizontal: { dark: "/images/brand/logo-v2.webp", light: "/images/brand/logo-light-v2.webp", width: 1200, height: 400 },
  stacked: { dark: "/images/brand/logo-stacked-v2.webp", light: "/images/brand/logo-stacked-light-v2.webp", width: 900, height: 830 },
} as const;

export function Logo({ variant = "dark", layout = "horizontal", className }: Props) {
  const dark = variant === "dark";
  const file = FILES[layout];
  return (
    <Link href="/" className={cn("inline-flex items-center", className)} aria-label="Egypt Gas Fittings, home">
      <Image
        src={dark ? file.dark : file.light}
        alt=""
        width={file.width}
        height={file.height}
        preload={dark}
        className={layout === "stacked" ? "h-auto w-44" : "h-14 w-auto sm:h-16"}
      />
    </Link>
  );
}
