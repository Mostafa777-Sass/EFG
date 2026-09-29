import Image, { type ImageProps } from "next/image";

/**
 * next/image wrapper. Files uploaded through the admin are already resized
 * WebP served by our own route handler, so they skip the optimizer.
 */
export function AppImage({ alt, unoptimized, ...props }: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  return <Image {...props} alt={alt} unoptimized={unoptimized ?? src.startsWith("/uploads/")} />;
}
