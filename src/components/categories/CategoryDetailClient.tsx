"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  PackageSearch,
} from "lucide-react";

import { useCategories } from "@/contexts/CategoryContext";
import { useProducts } from "@/contexts/ProductContext";
import { formatPrice } from "@/lib/format-price";
import type { Locale } from "@/lib/i18n/config";

type CategoryDetailDictionary = {
  viewAll: string;
  explore: string;
};

type ProductsDictionary = {
  newLabel: string;
  viewProduct: string;
};

type CategoryDetailClientProps = {
  locale: Locale;
  slug: string;
  categoryDictionary: CategoryDetailDictionary;
  productsDictionary: ProductsDictionary;
};

export default function CategoryDetailClient({
  locale,
  slug,
  categoryDictionary,
  productsDictionary,
}: CategoryDetailClientProps) {
  const {
    categories,
    isLoaded: categoriesLoaded,
  } = useCategories();

  const {
    products,
    isLoaded: productsLoaded,
  } = useProducts();

  const isLoaded =
    categoriesLoaded && productsLoaded;

  if (!isLoaded) {
    return (
      <div className="flex min-h-[520px] items-center justify-center border-y border-border px-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          {locale === "tr"
            ? "Kategori yükleniyor"
            : locale === "ar"
              ? "جارٍ تحميل الفئة"
              : "Loading category"}
        </p>
      </div>
    );
  }

  const category = categories.find(
    (item) =>
      item.slug === slug &&
      item.isActive
  );

  if (!category) {
    return (
      <CategoryNotFoundState
        locale={locale}
      />
    );
  }

  const categoryProducts = [...products]
    .filter(
      (product) =>
        product.categoryId ===
          category.id &&
        product.isActive
    )
    .sort(
      (a, b) => a.order - b.order
    );

  return (
    <div className="w-full">
      {/* Üst başlık */}
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <p className="w-full text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-accent sm:text-[11px]">
          {category.eyebrow[locale]}
        </p>

        <h1 className="mt-4 w-full text-center font-heading text-5xl leading-none sm:text-6xl lg:text-8xl">
          {category.name[locale]}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
          {locale === "tr"
            ? `${category.name[locale]} kategorisindeki seçkin LUXEA ürünlerini keşfedin.`
            : locale === "ar"
              ? `اكتشف منتجات LUXEA المختارة ضمن فئة ${category.name[locale]}.`
              : `Discover selected LUXEA pieces from the ${category.name[locale]} category.`}
        </p>

        <Link
          href={`/${locale}/categories`}
          className="group mt-8 inline-flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-foreground transition-colors duration-300 hover:text-accent"
        >
          <ArrowLeft
            size={14}
            strokeWidth={1.4}
            className="transition-transform duration-300 group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1"
          />

          <span>
            {locale === "tr"
              ? "Tüm Kategoriler"
              : locale === "ar"
                ? "جميع الفئات"
                : "All Categories"}
          </span>
        </Link>
      </div>

      {/* Ürünler */}
      {categoryProducts.length > 0 ? (
        <div className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categoryProducts.map(
            (product) => (
              <Link
                key={product.id}
                href={`/${locale}/products/${product.slug}`}
                className="group block min-w-0"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                  <Image
                    src={product.image}
                    alt={
                      product.name[locale]
                    }
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.025]"
                  />

                  {product.hoverImage && (
                    <Image
                      src={
                        product.hoverImage
                      }
                      alt={`${product.name[locale]} hover`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  )}

                  {product.isNew && (
                    <span className="absolute start-4 top-4 border border-white/45 bg-black/15 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                      {
                        productsDictionary.newLabel
                      }
                    </span>
                  )}
                </div>

                <div className="pt-5 text-center">
                  <h2 className="font-heading text-2xl leading-none text-foreground transition-colors duration-300 group-hover:text-accent">
                    {
                      product.name[
                        locale
                      ]
                    }
                  </h2>

                  <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-muted">
                    {formatPrice(
                      product.price,
                      product.currency,
                      locale
                    )}
                  </p>

                  <p className="mt-4 text-[8px] font-semibold uppercase tracking-[0.15em] text-accent">
                    {
                      productsDictionary.viewProduct
                    }
                  </p>
                </div>
              </Link>
            )
          )}
        </div>
      ) : (
        <div className="mt-14 flex min-h-[360px] flex-col items-center justify-center border-y border-border px-5 py-12 text-center">
          <PackageSearch
            size={34}
            strokeWidth={1.1}
            className="text-accent"
          />

          <h2 className="mt-7 font-heading text-4xl leading-none text-foreground sm:text-5xl">
            {locale === "tr"
              ? "Bu kategoride henüz ürün yok."
              : locale === "ar"
                ? "لا توجد منتجات في هذه الفئة حتى الآن."
                : "There are no products in this category yet."}
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-foreground-soft">
            {locale === "tr"
              ? "Yeni ürünler eklendiğinde burada otomatik olarak görünecek."
              : locale === "ar"
                ? "ستظهر المنتجات الجديدة هنا تلقائياً عند إضافتها."
                : "New products will appear here automatically when they are added."}
          </p>

          <Link
            href={`/${locale}/products`}
            className="mt-8 inline-flex min-h-12 items-center justify-center border border-foreground px-7 text-[9px] font-semibold uppercase tracking-[0.15em] text-foreground transition-all duration-300 hover:bg-foreground hover:text-white"
          >
            {categoryDictionary.viewAll}
          </Link>
        </div>
      )}
    </div>
  );
}

function CategoryNotFoundState({
  locale,
}: {
  locale: Locale;
}) {
  return (
    <div className="flex min-h-[520px] items-center justify-center border-y border-border px-5 py-14 text-center">
      <div className="mx-auto flex max-w-[620px] flex-col items-center">
        <PackageSearch
          size={34}
          strokeWidth={1.1}
          className="text-accent"
        />

        <h1 className="mt-7 font-heading text-5xl leading-none text-foreground sm:text-6xl">
          {locale === "tr"
            ? "Kategori bulunamadı."
            : locale === "ar"
              ? "لم يتم العثور على الفئة."
              : "Category not found."}
        </h1>

        <p className="mt-6 max-w-[520px] text-sm leading-7 text-foreground-soft">
          {locale === "tr"
            ? "Bu kategori silinmiş, pasif duruma getirilmiş veya bağlantısı değiştirilmiş olabilir."
            : locale === "ar"
              ? "قد تكون هذه الفئة قد حُذفت أو تم تعطيلها أو تغيير رابطها."
              : "This category may have been removed, deactivated, or its URL may have changed."}
        </p>

        <Link
          href={`/${locale}/categories`}
          className="mt-8 inline-flex min-h-12 items-center justify-center border border-foreground px-7 text-[9px] font-semibold uppercase tracking-[0.15em] text-foreground transition-all duration-300 hover:bg-foreground hover:text-white"
        >
          {locale === "tr"
            ? "Kategorilere Dön"
            : locale === "ar"
              ? "العودة إلى الفئات"
              : "Back to Categories"}
        </Link>
      </div>
    </div>
  );
}