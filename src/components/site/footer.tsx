import NextLink from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Mail, MapPin, Phone, Printer, ShieldCheck, Smartphone } from "lucide-react";
import type { Category, SiteSettings } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { pick } from "@/lib/l10n";
import { telHref } from "@/lib/utils";
import { Logo } from "./logo";

type Props = { settings: SiteSettings; categories: Category[] };

export async function Footer({ settings, categories }: Props) {
  const locale = await getLocale();
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const year = new Date().getFullYear();
  const companyName = pick(locale, settings.companyNameEn, settings.companyNameAr);

  return (
    <footer className="bg-navy-950 text-white/80">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo variant="light" idPrefix="ftr" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/70">{t("about")}</p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white">
            <ShieldCheck className="h-4 w-4 text-brand-gold" />
            {t("certified")}
          </p>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white">{t("quickLinks")}</h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {tn(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white">{t("products")}</h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={{ pathname: "/products", query: { category: c.slug } }} className="hover:text-white">
                  {pick(locale, c.nameEn, c.nameAr)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white">{t("contact")}</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {(settings.addressEn || settings.addressAr) && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
                <span>{pick(locale, settings.addressEn, settings.addressAr)}</span>
              </li>
            )}
            {settings.phone1 && (
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
                <span className="flex flex-col" dir="ltr">
                  <a href={telHref(settings.phone1)} className="hover:text-white">{settings.phone1}</a>
                  {settings.phone2 && <a href={telHref(settings.phone2)} className="hover:text-white">{settings.phone2}</a>}
                </span>
              </li>
            )}
            {settings.mobile1 && (
              <li className="flex gap-3">
                <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
                <span className="flex flex-col" dir="ltr">
                  <a href={telHref(settings.mobile1)} className="hover:text-white">{settings.mobile1}</a>
                  {settings.mobile2 && <a href={telHref(settings.mobile2)} className="hover:text-white">{settings.mobile2}</a>}
                </span>
              </li>
            )}
            {settings.fax && (
              <li className="flex gap-3">
                <Printer className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
                <span dir="ltr">{settings.fax}</span>
              </li>
            )}
            {settings.email && (
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
                <a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {companyName}. {t("rights")}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {settings.vatNumber && (
              <span>
                {t("vat")} <span dir="ltr">{settings.vatNumber}</span>
              </span>
            )}
            <NextLink href="/admin" className="hover:text-white">
              {t("admin")}
            </NextLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
