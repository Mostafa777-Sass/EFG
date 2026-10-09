import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Globe, Mail, MapPin, Phone, Printer, Smartphone } from "lucide-react";
import { COMPANY_WEBSITE_URL } from "@/lib/constants";
import { getContentPicker, getPublishedProducts, getSettings } from "@/lib/content";
import { pick } from "@/lib/l10n";
import { telHref } from "@/lib/utils";
import { PageHero } from "@/components/site/page-hero";
import { ContactForm } from "@/components/site/contact-form";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title") };
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { product } = await searchParams;
  setRequestLocale(locale);
  const [t, settings, c, products] = await Promise.all([
    getTranslations("contact"),
    getSettings(),
    getContentPicker(locale),
    getPublishedProducts(),
  ]);

  const address = pick(locale, settings.addressEn, settings.addressAr);
  const websiteHost = new URL(COMPANY_WEBSITE_URL).host;

  const rows: Array<{ Icon: typeof Phone; label: string; content: React.ReactNode }> = [];
  if (settings.phone1 || settings.phone2) {
    rows.push({
      Icon: Phone,
      label: t("phone"),
      content: (
        <span className="flex flex-col" dir="ltr">
          {settings.phone1 && <a href={telHref(settings.phone1)} className="hover:text-brand-red">{settings.phone1}</a>}
          {settings.phone2 && <a href={telHref(settings.phone2)} className="hover:text-brand-red">{settings.phone2}</a>}
        </span>
      ),
    });
  }
  if (settings.mobile1 || settings.mobile2) {
    rows.push({
      Icon: Smartphone,
      label: t("mobile"),
      content: (
        <span className="flex flex-col" dir="ltr">
          {settings.mobile1 && <a href={telHref(settings.mobile1)} className="hover:text-brand-red">{settings.mobile1}</a>}
          {settings.mobile2 && <a href={telHref(settings.mobile2)} className="hover:text-brand-red">{settings.mobile2}</a>}
        </span>
      ),
    });
  }
  if (settings.fax) rows.push({ Icon: Printer, label: t("fax"), content: <span dir="ltr">{settings.fax}</span> });
  if (settings.email) {
    rows.push({
      Icon: Mail,
      label: t("email"),
      content: <a href={`mailto:${settings.email}`} className="hover:text-brand-red">{settings.email}</a>,
    });
  }
  rows.push({ Icon: Globe, label: t("website"), content: <span dir="ltr">{websiteHost}</span> });
  if (address) rows.push({ Icon: MapPin, label: t("address"), content: <span>{address}</span> });

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={c("contact.intro")} />

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="text-2xl">{t("details")}</h2>
            <div className="red-rule" />
            <ul className="mt-8 space-y-5">
              {rows.map(({ Icon, label, content }) => (
                <li key={label} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mist-100 text-navy-900">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-300">{label}</p>
                    <div className="mt-0.5 font-medium text-navy-900">{content}</div>
                  </div>
                </li>
              ))}
            </ul>
            {settings.mapEmbedUrl && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-mist-200">
                <iframe
                  src={settings.mapEmbedUrl}
                  title={t("mapTitle")}
                  className="h-64 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-2xl">{t("formTitle")}</h2>
            <div className="red-rule" />
            <p className="mt-5 text-ink-500">{t("formIntro")}</p>
            <div className="mt-8">
              <ContactForm
                locale={locale}
                defaultProductSlug={product}
                products={products.map((p) => ({ slug: p.slug, name: pick(locale, p.nameEn, p.nameAr) }))}
                labels={{
                  name: t("name"),
                  company: t("company"),
                  email: t("emailField"),
                  phone: t("phoneField"),
                  country: t("country"),
                  product: t("product"),
                  productNone: t("productNone"),
                  subject: t("subject"),
                  message: t("message"),
                  send: t("send"),
                  sending: t("sending"),
                  successTitle: t("successTitle"),
                  success: t("success"),
                  sendAnother: t("sendAnother"),
                  error: t("error"),
                  required: t("required"),
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
