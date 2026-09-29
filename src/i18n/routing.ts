import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  // English lives at "/", Arabic at "/ar/...".
  localePrefix: "as-needed",
  // Do not auto-redirect visitors by browser language while the Arabic
  // content is still being completed. Flip to true once Arabic is ready.
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
