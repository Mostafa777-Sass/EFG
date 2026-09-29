import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, BadgeCheck, Cog, Flame, House, ShieldCheck, Wind, Workflow } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  getCertifications,
  getClients,
  getContentPicker,
  getFacilityPhotos,
  getPublishedProducts,
  getSettings,
} from "@/lib/content";
import { pick } from "@/lib/l10n";
import { lines } from "@/lib/utils";
import { AppImage } from "@/components/ui/app-image";
import { SectionHeading } from "@/components/site/section-heading";
import { ProductCard } from "@/components/site/product-card";
import { ClientLogoGrid } from "@/components/site/client-logo-grid";
import { StatBand } from "@/components/site/stat-band";
import { CtaBand } from "@/components/site/cta-band";

type Props = { params: Promise<{ locale: string }> };

const PILLARS = [
  { key: "quality", Icon: ShieldCheck },
  { key: "precision", Icon: Cog },
  { key: "safety", Icon: House },
] as const;

const TECHNOLOGIES = [
  { key: "cnc", Icon: Cog },
  { key: "welding", Icon: Flame },
  { key: "transfer", Icon: Workflow },
  { key: "hose", Icon: Wind },
] as const;

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tc, tcap, settings, c, featured, certifications, clients, photos] = await Promise.all([
    getTranslations("home"),
    getTranslations("common"),
    getTranslations("capabilities"),
    getSettings(),
    getContentPicker(locale),
    getPublishedProducts({ featured: true, take: 6 }),
    getCertifications(),
    getClients(),
    getFacilityPhotos(3),
  ]);

  const standards = lines(settings.standards);
  const stats = [
    { value: settings.unitsProduced ?? "2,000,000+", label: t("stats.units", { year: settings.unitsProducedYear ?? 2025 }) },
    { value: String(settings.foundedYear ?? 2005), label: t("stats.founded") },
    { value: String(clients.length), label: t("stats.partners") },
    { value: String(standards.length), label: t("stats.standards") },
  ];
  const cardLabels = { size: tc("size"), standard: tc("standard"), noImage: tc("noImage") };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-y-0 end-0 hidden w-5/12 bg-mist-100 lg:block" aria-hidden="true" />
        <div className="container-x relative grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="eyebrow inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-orange" />
              {c("hero.eyebrow", t("hero.eyebrow"))}
            </p>
            <h1 className="mt-5 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">{c("hero.title")}</h1>
            <div className="red-rule" />
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500">{c("hero.subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                {t("hero.ctaProducts")}
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </Link>
              <Link href="/contact" className="btn-outline">
                {t("hero.ctaQuote")}
              </Link>
            </div>

            <ul className="mt-12 grid gap-6 sm:grid-cols-3">
              {PILLARS.map(({ key, Icon }) => (
                <li key={key} className="flex gap-3 sm:flex-col">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-navy-900 text-navy-900">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-navy-900">{t(`pillars.${key}.title`)}</p>
                    <p className="mt-1 text-sm text-ink-500">{t(`pillars.${key}.text`)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="relative aspect-[1086/1010] overflow-hidden rounded-3xl border border-mist-200 shadow-card">
              <Image
                src="/images/brand/hero.webp"
                alt={t("hero.imageAlt")}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-5 start-6 flex items-center gap-3 rounded-xl bg-navy-900 px-4 py-3 text-white shadow-card">
              <BadgeCheck className="h-7 w-7 text-brand-gold" />
              <div>
                <p className="text-sm font-bold">{t("hero.badge")}</p>
                <p className="text-xs text-white/70">{t("hero.badgeSub")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <StatBand stats={stats} />

      {/* Featured products */}
      <section className="section">
        <div className="container-x">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow={t("products.eyebrow")} title={t("products.title")} intro={t("products.intro")} className="max-w-2xl" />
            <Link href="/products" className="btn-outline shrink-0">
              {tc("viewAll")}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} labels={cardLabels} />
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section border-y border-mist-200 bg-mist-100">
        <div className="container-x">
          <SectionHeading eyebrow={t("capabilities.eyebrow")} title={t("capabilities.title")} intro={t("capabilities.intro")} align="center" />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TECHNOLOGIES.map(({ key, Icon }) => (
              <li key={key} className="card-white">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg">{tcap(`technologies.${key}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{tcap(`technologies.${key}.text`)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Link href="/capabilities" className="btn-navy">
              {t("capabilities.cta")}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quality */}
      <section className="section">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={t("quality.eyebrow")} title={t("quality.title")} intro={t("quality.intro")} />
            <ul className="mt-8 flex flex-wrap gap-2">
              {standards.map((s) => (
                <li key={s} className="chip" dir="ltr">
                  {s}
                </li>
              ))}
            </ul>
            <Link href="/quality" className="btn-outline mt-8">
              {t("quality.cta")}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {certifications.map((cert) => (
              <li key={cert.id} className="flex flex-col items-center rounded-2xl border border-mist-200 bg-white p-5 text-center shadow-card">
                <div className="relative h-24 w-24">
                  {cert.imageUrl ? (
                    <AppImage src={cert.imageUrl} alt={pick(locale, cert.nameEn, cert.nameAr)} fill sizes="96px" className="object-contain" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-mist-100 text-navy-900">
                      <BadgeCheck className="h-10 w-10" />
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm font-bold text-navy-900">{pick(locale, cert.nameEn, cert.nameAr)}</p>
                {(cert.issuerEn || cert.issuerAr) && (
                  <p className="mt-1 text-xs text-ink-500">{pick(locale, cert.issuerEn, cert.issuerAr)}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Clients */}
      <section className="section border-y border-mist-200 bg-mist-100">
        <div className="container-x">
          <SectionHeading eyebrow={t("clients.eyebrow")} title={t("clients.title")} intro={t("clients.intro")} align="center" />
          <div className="mt-12">
            <ClientLogoGrid clients={clients} locale={locale} compact />
          </div>
          <div className="mt-10 text-center">
            <Link href="/clients" className="btn-outline">
              {t("clients.cta")}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </div>
        </div>
      </section>

      {/* Facility */}
      {photos.length > 0 && (
        <section className="section">
          <div className="container-x">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading eyebrow={t("facility.eyebrow")} title={t("facility.title")} />
              <Link href="/facility" className="btn-outline shrink-0">
                {t("facility.cta")}
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </Link>
            </div>
            <ul className="mt-12 grid gap-5 sm:grid-cols-3">
              {photos.map((photo) => (
                <li key={photo.id} className="overflow-hidden rounded-2xl border border-mist-200 shadow-card">
                  <div className="relative aspect-[4/3] bg-mist-100">
                    <AppImage
                      src={photo.imageUrl}
                      alt={pick(locale, photo.titleEn, photo.titleAr)}
                      fill
                      sizes="(min-width: 640px) 30vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="p-4 text-sm font-bold text-navy-900">{pick(locale, photo.titleEn, photo.titleAr)}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBand
        title={c("cta.title")}
        text={c("cta.text")}
        buttonLabel={t("cta.button")}
        phone={settings.phone1}
        callLabel={t("cta.call")}
      />
    </>
  );
}
