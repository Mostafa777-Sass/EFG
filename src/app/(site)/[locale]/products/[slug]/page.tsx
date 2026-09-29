import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Package, Phone, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getProductBySlug, getPublishedProducts, getSettings } from "@/lib/content";
import { pick } from "@/lib/l10n";
import { telHref } from "@/lib/utils";
import { AppImage } from "@/components/ui/app-image";
import { ProductCard } from "@/components/site/product-card";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const name = pick(locale, product.nameEn, product.nameAr);
  const description = pick(locale, product.shortDescriptionEn, product.shortDescriptionAr) || undefined;
  return {
    title: name,
    description,
    openGraph: product.imageUrl ? { images: [{ url: product.imageUrl }] } : undefined,
  };
}

function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [t, tc, settings] = await Promise.all([getTranslations("products"), getTranslations("common"), getSettings()]);
  const related = product.category
    ? (await getPublishedProducts({ categorySlug: product.category.slug })).filter((p) => p.id !== product.id).slice(0, 3)
    : [];

  const name = pick(locale, product.nameEn, product.nameAr);
  const short = pick(locale, product.shortDescriptionEn, product.shortDescriptionAr);
  const description = pick(locale, product.descriptionEn, product.descriptionAr);
  const categoryName = product.category ? pick(locale, product.category.nameEn, product.category.nameAr) : null;

  const specs = [
    { label: tc("size"), value: product.sizes },
    { label: tc("standard"), value: product.standard },
    { label: tc("material"), value: product.material },
    { label: tc("category"), value: categoryName },
  ].filter((s) => s.value);

  const cardLabels = { size: tc("size"), standard: tc("standard"), noImage: tc("noImage") };

  return (
    <>
      <section className="border-b border-mist-200 bg-mist-100">
        <div className="container-x py-5">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-brand-red">
            <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
            {t("backToProducts")}
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-mist-200 bg-white shadow-card">
            {product.imageUrl ? (
              <AppImage
                src={product.imageUrl}
                alt={name}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain p-8 sm:p-12"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-300">
                <Package className="h-16 w-16" />
                <span className="text-sm">{tc("noImage")}</span>
              </div>
            )}
          </div>

          <div>
            {categoryName && <p className="eyebrow">{categoryName}</p>}
            <h1 className="mt-3 text-4xl sm:text-5xl">{name}</h1>
            <div className="red-rule" />
            {short && <p className="mt-6 text-lg leading-relaxed text-ink-500">{short}</p>}

            {specs.length > 0 && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-mist-200">
                <h2 className="bg-mist-100 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-500">
                  {t("specifications")}
                </h2>
                <dl className="divide-y divide-mist-200">
                  {specs.map((spec) => (
                    <div key={spec.label} className="grid grid-cols-3 gap-4 px-5 py-3 text-sm">
                      <dt className="font-semibold text-navy-900">{spec.label}</dt>
                      <dd className="col-span-2 text-ink-700" dir={spec.label === tc("category") ? undefined : "ltr"}>
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {description && (
              <div className="prose-egf mt-8">
                {paragraphs(description).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={{ pathname: "/contact", query: { product: product.slug } }} className="btn-primary">
                <Send className="h-4 w-4 rtl:-scale-x-100" />
                {t("requestQuote")}
              </Link>
              {settings.phone1 && (
                <a href={telHref(settings.phone1)} className="btn-outline">
                  <Phone className="h-4 w-4" />
                  <span dir="ltr">{settings.phone1}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section border-t border-mist-200 bg-mist-100">
          <div className="container-x">
            <h2 className="text-2xl sm:text-3xl">{t("related")}</h2>
            <div className="red-rule" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} locale={locale} labels={cardLabels} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
