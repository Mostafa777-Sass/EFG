export type Locale = "en" | "ar";

/** Returns the Arabic text when the locale is Arabic and a translation exists, otherwise English. */
export function pick(
  locale: string,
  en: string | null | undefined,
  ar: string | null | undefined,
): string {
  if (locale === "ar" && ar && ar.trim().length > 0) return ar;
  return en ?? "";
}

export function isRtl(locale: string): boolean {
  return locale === "ar";
}

export function otherLocale(locale: string): Locale {
  return locale === "ar" ? "en" : "ar";
}
