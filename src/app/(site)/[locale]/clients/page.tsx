import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Globe, Handshake } from "lucide-react";
import { getClients, getContentPicker, getSettings } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { ClientLogoGrid } from "@/components/site/client-logo-grid";
import { CtaBand } from "@/components/site/cta-band";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "clients" });
  return { title: t("title") };
}

export default async function ClientsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, th, settings, c, clients] = await Promise.all([
    getTranslations("clients"),
    getTranslations("home"),
    getSettings(),
    getContentPicker(locale),
    getClients(),
  ]);
  const domestic = clients.filter((cl) => cl.type !== "EXPORT");
  const exportClients = clients.filter((cl) => cl.type === "EXPORT");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={c("clients.intro")} />

      <section className="section">
        <div className="container-x">
          {c("clients.tagline") && <p className="mb-10 max-w-3xl text-lg text-ink-500">{c("clients.tagline")}</p>}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex gap-4 rounded-2xl bg-navy-900 p-7 text-white">
              <Handshake className="h-8 w-8 shrink-0 text-brand-gold" />
              <div>
                <h2 className="text-lg text-white">{t("domestic")}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{t("domesticText")}</p>
              </div>
            </div>
            <div className="flex gap-4 rounded-2xl bg-navy-900 p-7 text-white">
              <Globe className="h-8 w-8 shrink-0 text-brand-gold" />
              <div>
                <h2 className="text-lg text-white">{t("export")}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{t("exportText")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {domestic.length > 0 && (
        <section className="section border-t border-mist-200 bg-mist-100">
          <div className="container-x">
            <SectionHeading title={t("domestic")} intro={t("domesticText")} />
            <div className="mt-10">
              <ClientLogoGrid clients={domestic} locale={locale} />
            </div>
          </div>
        </section>
      )}

      {exportClients.length > 0 && (
        <section className="section border-t border-mist-200">
          <div className="container-x">
            <SectionHeading title={t("export")} intro={t("exportText")} />
            <div className="mt-10">
              <ClientLogoGrid clients={exportClients} locale={locale} />
            </div>
          </div>
        </section>
      )}

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
