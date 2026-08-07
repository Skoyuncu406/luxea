"use client";

import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";

import AdminProductForm from "@/components/admin/products/AdminProductForm";
import { useProducts } from "@/contexts/ProductContext";
import type { Locale } from "@/lib/i18n/config";

type AdminProductFormDictionary = React.ComponentProps<
  typeof AdminProductForm
>["dictionary"];

type AdminEditProductClientProps = {
  locale: Locale;
  productId: string;
  dictionary: AdminProductFormDictionary;
};

export default function AdminEditProductClient({
  locale,
  productId,
  dictionary,
}: AdminEditProductClientProps) {
  const {
    isLoaded,
    findProductById,
  } = useProducts();

  if (!isLoaded) {
    return (
      <div className="flex min-h-[420px] items-center justify-center border-y border-border px-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          {locale === "tr"
            ? "Ürün yükleniyor"
            : locale === "ar"
              ? "جارٍ تحميل المنتج"
              : "Loading product"}
        </p>
      </div>
    );
  }

  const product =
    findProductById(productId);

  if (!product) {
    const title =
      locale === "tr"
        ? "Ürün bulunamadı."
        : locale === "ar"
          ? "لم يتم العثور على المنتج."
          : "Product not found.";

    const description =
      locale === "tr"
        ? "Düzenlemek istediğiniz ürün silinmiş veya mevcut olmayabilir."
        : locale === "ar"
          ? "قد يكون المنتج الذي تريد تعديله قد تم حذفه أو لم يعد موجوداً."
          : "The product you want to edit may have been deleted or may no longer exist.";

    const backLabel =
      locale === "tr"
        ? "Ürünlere Dön"
        : locale === "ar"
          ? "العودة إلى المنتجات"
          : "Back to Products";

    return (
      <div className="flex min-h-[520px] items-center justify-center border border-border bg-surface/40 px-5 py-14 text-center">
        <div className="mx-auto flex max-w-[620px] flex-col items-center">
          <span className="flex h-20 w-20 items-center justify-center border border-accent/30 bg-accent/10 text-accent">
            <PackageSearch
              size={31}
              strokeWidth={1.15}
            />
          </span>

          <h2 className="mt-7 font-heading text-5xl leading-none text-foreground sm:text-6xl">
            {title}
          </h2>

          <p className="mt-6 max-w-[520px] text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
            {description}
          </p>

          <Link
            href={`/${locale}/admin/products`}
            className={[
              "group mt-9 inline-flex min-h-14",
              "items-center justify-center gap-3",
              "border border-foreground",
              "bg-foreground px-7",
              "text-[9px] font-semibold uppercase",
              "tracking-[0.16em]",
              "!text-[#F3F0EA]",
              "transition-all duration-300",
              "hover:border-accent",
              "hover:bg-accent",
              "hover:!text-white",
            ].join(" ")}
          >
            <ArrowLeft
              size={15}
              strokeWidth={1.4}
              className="rtl:rotate-180"
            />

            <span>{backLabel}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminProductForm
      locale={locale}
      dictionary={dictionary}
      product={product}
    />
  );
}