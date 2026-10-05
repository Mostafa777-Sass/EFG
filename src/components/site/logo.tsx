import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  /**
   * "dark" (default): the logo for light backgrounds.
   * "light": the same lockup with a white wordmark, for dark panels.
   */
  variant?: "dark" | "light";
  className?: string;
};

export function Logo({ variant = "dark", className }: Props) {
  const dark = variant === "dark";
  return (
    <Link href="/" className={cn("inline-flex items-center", className)} aria-label="Egypt Gas Fittings, home">
      <Image
        src={dark ? "/images/brand/logo.webp" : "/images/brand/logo-light.webp"}
        alt=""
        width={198}
        height={80}
        preload={dark}
        className="h-14 w-auto sm:h-16"
      />
    </Link>
  );
}
