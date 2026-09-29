import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeCheck, Ship, Truck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getCategories, getContentPicker, getPublishedProducts, getSettings } from "@/lib/content";
import { pick } from "@/lib/l10n";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/site/page-hero";
import { ProductCard } from "@/components/site/product-card";
import { CtaBand } from "@/components/site/cta-band";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

const SERVICES = [
  { key: "standard", Icon: BadgeCheck },
  { key: "export", Icon: Ship },
  { key: "distribution", Icon: Truck },
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });
  return { title: t("title") };
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);

  const [t, tc, th, settings, c, categories] = await Promise.all([
    getTranslations("products"),
    getTranslations("common"),
    getTranslations("home"),
    getSettings(),
    getContentPicker(locale),
    getCategories(),
  ]);
  const activeCategory = categories.find((cat) => cat.slug === category) ?? null;
  const products = await getPublishedProducts({ categorySlug: activeCategory?.slug });
  const cardLabels = { size: tc("size"), standard: tc("standard"), noImage: tc("noImage") };

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={c("products.intro")} />

      <section className="section">
        <div className="container-x">
          <nav className="flex flex-wrap gap-2" aria-label={t("filterLabel")}>
            <Link
              href="/products"
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                !activeCategory ? "border-navy-900 bg-navy-900 text-white" : "border-mist-300 bg-white text-navy-900 hover:border-navy-900",
              )}
            >
              {t("filterAll")}
            </Link>
            {categories
              .filter((cat) => cat._count.products > 0)
              .map((cat) => {
                const active = activeCategory?.id === cat.id;
                return (
                  <Link
                    key={cat.id}
                    href={{ pathname: "/products", query: { category: cat.slug } }}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                      active ? "border-navy-900 bg-navy-900 text-white" : "border-mist-300 bg-white text-navy-900 hover:border-navy-900",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {pick(locale, cat.nameEn, cat.nameAr)}
                    <span className={cn("ms-2 text-xs", active ? "text-white/70" : "text-ink-300")}>{cat._count.products}</span>
                  </Link>
                );
              })}
          </nav>

          {activeCategory && (activeCategory.descriptionEn || activeCategory.descriptionAr) && (
            <p className="mt-6 max-w-3xl text-ink-500">{pick(locale, activeCategory.descriptionEn, activeCategory.descriptionAr)}</p>
          )}

          {products.length === 0 ? (
            <p className="mt-12 rounded-2xl border border-dashed border-mist-300 p-10 text-center text-ink-500">{t("empty")}</p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} labels={cardLabels} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section border-t border-mist-200 bg-mist-100">
        <div className="container-x">
          <ul className="grid gap-5 md:grid-cols-3">
            {SERVICES.map(({ key, Icon }) => (
              <li key={key} className="card-white">
                <Icon className="h-8 w-8 text-brand-red" />
                <h3 className="mt-4 text-lg">{t(`services.${key}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{t(`services.${key}.text`)}</p>
              </li>
            ))}
          </ul>
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
