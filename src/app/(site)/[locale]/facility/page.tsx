import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin } from "lucide-react";
import { getContentPicker, getFacilityPhotos, getSettings } from "@/lib/content";
import { pick } from "@/lib/l10n";
import { PageHero } from "@/components/site/page-hero";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { CtaBand } from "@/components/site/cta-band";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "facility" });
  return { title: t("title") };
}

export default async function FacilityPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, th, settings, c, photos] = await Promise.all([
    getTranslations("facility"),
    getTranslations("home"),
    getSettings(),
    getContentPicker(locale),
    getFacilityPhotos(),
  ]);
  const address = pick(locale, settings.addressEn, settings.addressAr);

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={c("facility.intro")}>
        {address && (
          <p className="mt-6 inline-flex items-center gap-2 rounded-lg border border-mist-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900">
            <MapPin className="h-4 w-4 text-brand-red" />
            <span>
              {t("address")}: {address}
            </span>
          </p>
        )}
      </PageHero>

      <section className="section">
        <div className="container-x">
          <GalleryGrid
            photos={photos.map((p) => ({
              id: p.id,
              src: p.imageUrl,
              title: pick(locale, p.titleEn, p.titleAr),
              caption: pick(locale, p.captionEn, p.captionAr) || null,
            }))}
            viewLabel={t("viewLarger")}
            closeLabel={t("close")}
          />
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
