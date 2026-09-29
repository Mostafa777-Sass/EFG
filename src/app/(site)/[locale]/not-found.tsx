import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Watermark } from "@/components/brand/watermark";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <section className="relative overflow-hidden">
      <Watermark className="-bottom-24 -end-10 h-96 w-96 text-navy-900/[0.04]" />
      <div className="container-x relative py-28 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">{t("title")}</h1>
        <div className="red-rule mx-auto" />
        <p className="mx-auto mt-6 max-w-md text-lg text-ink-500">{t("text")}</p>
        <Link href="/" className="btn-navy mt-8">
          <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
          {t("home")}
        </Link>
      </div>
    </section>
  );
}
