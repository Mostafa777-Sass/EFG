import { Package } from "lucide-react";
import type { Category, Product } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { pick } from "@/lib/l10n";
import { AppImage } from "@/components/ui/app-image";

type Props = {
  product: Product & { category: Category | null };
  locale: string;
  labels: { size: string; standard: string; noImage: string };
};

export function ProductCard({ product, locale, labels }: Props) {
  const name = pick(locale, product.nameEn, product.nameAr);
  const category = product.category ? pick(locale, product.category.nameEn, product.category.nameAr) : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:border-navy-900/20"
    >
      <div className="relative aspect-[4/3] bg-white">
        {product.imageUrl ? (
          <AppImage
            src={product.imageUrl}
            alt={name}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-contain p-6 transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-300">
            <Package className="h-10 w-10" />
            <span className="text-xs">{labels.noImage}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 border-t border-mist-200 p-5">
        {category && <p className="eyebrow text-[10px]">{category}</p>}
        <h3 className="text-lg leading-snug text-navy-900 transition-colors group-hover:text-brand-red">{name}</h3>
        <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-2 pt-2 text-xs">
          {product.sizes && (
            <div>
              <dt className="font-semibold uppercase tracking-wider text-ink-300">{labels.size}</dt>
              <dd className="mt-0.5 font-medium text-ink-700" dir="ltr">{product.sizes}</dd>
            </div>
          )}
          {product.standard && (
            <div>
              <dt className="font-semibold uppercase tracking-wider text-ink-300">{labels.standard}</dt>
              <dd className="mt-0.5 font-medium text-ink-700" dir="ltr">{product.standard}</dd>
            </div>
          )}
        </dl>
      </div>
    </Link>
  );
}
