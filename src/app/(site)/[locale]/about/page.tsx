import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeCheck, Calendar, Compass, Globe, MapPin, Target, UserRound } from "lucide-react";
import { getContentPicker, getSettings } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBand } from "@/components/site/cta-band";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, th, settings, c] = await Promise.all([
    getTranslations("about"),
    getTranslations("home"),
    getSettings(),
    getContentPicker(locale),
  ]);

  const facts = [
    { Icon: Calendar, label: t("established"), value: String(settings.foundedYear ?? 2005) },
    { Icon: MapPin, label: t("location"), value: t("locationValue") },
    { Icon: BadgeCheck, label: t("certification"), value: t("certificationValue") },
    { Icon: Globe, label: t("export"), value: t("exportValue") },
  ];

  const leaders = [
    { name: c("about.chairman.name"), title: c("about.chairman.title") },
    { name: c("about.ceo.name"), title: c("about.ceo.title") },
  ].filter((l) => l.name);

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={c("about.history.1")} />

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-3">
          <div className="prose-egf text-lg lg:col-span-2">
            <p>{c("about.history.2")}</p>
            <p>{c("about.history.3")}</p>
            {leaders.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl">{t("leadership")}</h2>
                <div className="red-rule" />
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {leaders.map((leader) => (
                    <li key={leader.name} className="flex items-center gap-4 rounded-2xl border border-mist-200 bg-white p-5 shadow-card">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-mist-100 text-navy-900">
                        <UserRound className="h-7 w-7" />
                      </span>
                      <div>
                        <p className="text-base font-bold text-navy-900">{leader.name}</p>
                        <p className="eyebrow mt-1 text-[10px]">{leader.title}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="card h-fit">
            <h2 className="text-xl">{t("facts")}</h2>
            <ul className="mt-6 space-y-5">
              {facts.map(({ Icon, label, value }) => (
                <li key={label} className="flex gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-300">{label}</p>
                    <p className="mt-0.5 font-semibold text-navy-900">{value}</p>
                  </div>
                </li>
              ))}
              {settings.unitsProduced && (
                <li className="rounded-xl bg-navy-900 p-4 text-white">
                  <p className="text-3xl font-extrabold" dir="ltr">{settings.unitsProduced}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/70">
                    {t("units", { year: settings.unitsProducedYear ?? 2025 })}
                  </p>
                </li>
              )}
              {settings.vatNumber && (
                <li className="text-xs text-ink-500">
                  {t("vat")}: <span dir="ltr">{settings.vatNumber}</span>
                </li>
              )}
            </ul>
          </aside>
        </div>
      </section>

      <section className="section border-t border-mist-200 bg-mist-100">
        <div className="container-x">
          <SectionHeading eyebrow={t("eyebrow")} title={`${t("vision")} & ${t("mission")}`} align="center" />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl bg-navy-900 p-8 text-white sm:p-10">
              <Compass className="h-9 w-9 text-brand-gold" />
              <h3 className="mt-5 text-2xl text-white">{t("vision")}</h3>
              <p className="mt-4 text-lg leading-relaxed text-white/80">{c("about.vision")}</p>
            </div>
            <div className="card-white sm:p-10">
              <Target className="h-9 w-9 text-brand-red" />
              <h3 className="mt-5 text-2xl">{t("mission")}</h3>
              <p className="mt-4 text-lg leading-relaxed text-ink-700">{c("about.mission")}</p>
            </div>
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
