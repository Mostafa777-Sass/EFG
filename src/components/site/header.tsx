import { getTranslations } from "next-intl/server";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import type { SiteSettings } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { telHref } from "@/lib/utils";
import { Logo } from "./logo";
import { SiteNav } from "./site-nav";
import { LocaleSwitcher } from "./locale-switcher";

export async function Header({ settings }: { settings: SiteSettings }) {
  const t = await getTranslations("nav");
  const tb = await getTranslations("topbar");
  const items = NAV_ITEMS.map((item) => ({ href: item.href, label: t(item.key) }));

  return (
    <header className="sticky top-0 z-40 border-b border-mist-200 bg-white/95 backdrop-blur">
      {/* Contact strip from 1024px up; below that phones and tablets get a single bar with the menu toggle. */}
      <div className="hidden bg-navy-900 text-xs text-white/85 lg:block">
        <div className="container-x flex h-9 items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {settings.phone1 && (
              <a href={telHref(settings.phone1)} className="inline-flex items-center gap-1.5 hover:text-white">
                <Phone className="h-3.5 w-3.5" />
                <span dir="ltr">{settings.phone1}</span>
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-1.5 hover:text-white">
                <Mail className="h-3.5 w-3.5" />
                {settings.email}
              </a>
            )}
          </div>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-gold" />
              {tb("certified")}
            </span>
            {settings.arabicEnabled && <LocaleSwitcher label={tb("switchLocale")} />}
          </div>
        </div>
      </div>

      <div className="container-x flex h-20 items-center justify-between gap-6">
        <Logo />
        {/* One navigation element: the menu-toggle panel below 1024px, the inline link row from 1024px up. */}
        <SiteNav
          items={items}
          label={t("mainNavigation")}
          quoteLabel={t("requestQuote")}
          menuLabel={t("menu")}
          closeLabel={t("close")}
          localeLabel={settings.arabicEnabled ? tb("switchLocale") : null}
        >
          <Link href="/contact" className="btn-primary btn-sm hidden md:inline-flex">
            {t("requestQuote")}
          </Link>
        </SiteNav>
      </div>
    </header>
  );
}
