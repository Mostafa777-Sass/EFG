import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeCheck, CircleCheck, Quote } from "lucide-react";
import { getCertifications, getContentPicker, getSettings } from "@/lib/content";
import { pick } from "@/lib/l10n";
import { lines } from "@/lib/utils";
import { AppImage } from "@/components/ui/app-image";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBand } from "@/components/site/cta-band";

type Props = { params: Promise<{ locale: string }> };

const TESTS = ["sample", "pressure", "tensile", "pneumatic", "chemical", "pull"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quality" });
  return { title: t("title") };
}

export default async function QualityPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, th, settings, c, certifications] = await Promise.all([
    getTranslations("quality"),
    getTranslations("home"),
    getSettings(),
    getContentPicker(locale),
    getCertifications(),
  ]);
  const standards = lines(settings.standards);

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={c("quality.intro")} />

      <section className="section">
        <div className="container-x">
          <SectionHeading title={t("certifications")} />
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {certifications.map((cert) => (
              <li key={cert.id} className="card-white flex gap-5">
                <div className="relative h-20 w-20 shrink-0">
                  {cert.imageUrl ? (
                    <AppImage src={cert.imageUrl} alt={pick(locale, cert.nameEn, cert.nameAr)} fill sizes="80px" className="object-contain" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-mist-100 text-navy-900">
                      <BadgeCheck className="h-9 w-9" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg">{pick(locale, cert.nameEn, cert.nameAr)}</h3>
                  {(cert.issuerEn || cert.issuerAr) && (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-300">{pick(locale, cert.issuerEn, cert.issuerAr)}</p>
                  )}
                  {(cert.descriptionEn || cert.descriptionAr) && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-500">{pick(locale, cert.descriptionEn, cert.descriptionAr)}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {standards.length > 0 && (
        <section className="relative overflow-hidden bg-navy-900 py-14 text-white">
          <div className="container-x">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">{t("standardsTitle")}</p>
            <ul className="mt-8 flex flex-wrap justify-center gap-3">
              {standards.map((s) => (
                <li key={s} className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold" dir="ltr">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-mist-200 shadow-card">
            <AppImage src="/images/facility/quality-control-lab.webp" alt={t("labAlt")} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <SectionHeading eyebrow={t("lab")} title={t("testingTitle")} intro={c("quality.lab")} />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {TESTS.map((key) => (
                <li key={key} className="flex items-center gap-3 rounded-xl border border-mist-200 bg-white px-4 py-3 text-sm font-semibold text-navy-900">
                  <CircleCheck className="h-5 w-5 shrink-0 text-brand-red" />
                  {t(`tests.${key}`)}
                </li>
              ))}
            </ul>
            {c("quality.quote") && (
              <blockquote className="mt-8 flex gap-4 rounded-2xl bg-mist-100 p-6">
                <Quote className="h-6 w-6 shrink-0 text-brand-red" />
                <p className="italic leading-relaxed text-ink-700">{c("quality.quote")}</p>
              </blockquote>
            )}
          </div>
        </div>
      </section>

      <CtaBand
        title={c("cta.title")}
        text={c("cta.text")}
        buttonLabel={th("cta.button")}
        phone={settings.phone1}
        callLabel={th("cta.call")}
      />
    </>
  );
}
