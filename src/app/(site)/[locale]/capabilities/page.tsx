import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Cog, Flame, Gauge, Globe, Layers, ShieldCheck, Wind, Workflow } from "lucide-react";
import { getContentPicker, getSettings } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBand } from "@/components/site/cta-band";

type Props = { params: Promise<{ locale: string }> };

const TECHNOLOGIES = [
  { key: "cnc", Icon: Cog },
  { key: "welding", Icon: Flame },
  { key: "transfer", Icon: Workflow },
  { key: "hose", Icon: Wind },
] as const;

const STEPS = ["1", "2", "3", "4", "5", "6"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "capabilities" });
  return { title: t("title") };
}

export default async function CapabilitiesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, th, settings, c] = await Promise.all([
    getTranslations("capabilities"),
    getTranslations("home"),
    getSettings(),
    getContentPicker(locale),
  ]);

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={c("capabilities.intro")} />

      <section className="section">
        <div className="container-x">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TECHNOLOGIES.map(({ key, Icon }) => (
              <li key={key} className="card-white">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-lg">{t(`technologies.${key}.title`)}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{t(`technologies.${key}.text`)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="flex gap-4 rounded-2xl bg-navy-900 p-7 text-white">
              <Gauge className="h-8 w-8 shrink-0 text-brand-gold" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">{t("capacity")}</p>
                <p className="mt-2 text-lg font-semibold">{c("capabilities.capacity")}</p>
              </div>
            </div>
            <div className="flex gap-4 rounded-2xl bg-navy-900 p-7 text-white">
              <Globe className="h-8 w-8 shrink-0 text-brand-gold" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">{t("export")}</p>
                <p className="mt-2 text-lg font-semibold">{c("capabilities.export")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section border-t border-mist-200 bg-mist-100">
        <div className="container-x">
          <SectionHeading eyebrow={t("processEyebrow")} title={t("processTitle")} intro={c("capabilities.process.intro")} className="max-w-3xl" />
          <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step} className="card-white relative pt-8">
                <span className="absolute -top-4 start-6 flex h-9 w-9 items-center justify-center rounded-full bg-brand-red text-sm font-extrabold text-white">
                  {step.padStart(2, "0")}
                </span>
                <h3 className="text-lg">{t(`steps.${step}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{t(`steps.${step}.text`)}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="flex gap-4 rounded-2xl border border-mist-200 bg-white p-7">
              <Layers className="h-8 w-8 shrink-0 text-brand-red" />
              <div>
                <h3 className="text-lg">{t("integrated.title")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{t("integrated.text")}</p>
              </div>
            </div>
            <div className="flex gap-4 rounded-2xl border border-mist-200 bg-white p-7">
              <ShieldCheck className="h-8 w-8 shrink-0 text-brand-red" />
              <div>
                <h3 className="text-lg">{t("everyStage.title")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{t("everyStage.text")}</p>
              </div>
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
