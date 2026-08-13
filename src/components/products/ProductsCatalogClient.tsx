"use client";

import ProductsCatalog from "@/components/products/ProductsCatalog";

import {
  useCategories,
} from "@/contexts/CategoryContext";

import {
  useProducts,
} from "@/contexts/ProductContext";

import type {
  Locale,
} from "@/lib/i18n/config";

type ProductsCatalogDictionary = {
  searchPlaceholder: string;
  filterCategories: string;
  allCategories: string;
  productsFound: string;
  noProducts: string;
  clearFilters: string;
  newLabel: string;
  viewProduct: string;

  sortBy: string;
  sortRecommended: string;
  sortNewest: string;
  sortPriceLow: string;
  sortPriceHigh: string;

  addToFavorites: string;
  removeFromFavorites: string;
};

type ProductsCatalogClientProps = {
  locale: Locale;
  dictionary:
    ProductsCatalogDictionary;
};

export default function ProductsCatalogClient({
  locale,
  dictionary,
}: ProductsCatalogClientProps) {
  const {
    products,
    isLoaded:
      productsLoaded,
  } = useProducts();

  const {
    categories,
    isLoaded:
      categoriesLoaded,
  } = useCategories();

  const isLoaded =
    productsLoaded &&
    categoriesLoaded;

  if (!isLoaded) {
    return (
      <div
        className="
          flex
          min-h-[420px]
          items-center
          justify-center

          border-y
          border-white/20

          px-5

          text-center
        "
      >
        <div className="flex flex-col items-center">
          <span
            className="
              h-7
              w-7

              animate-spin

              rounded-full

              border
              border-white/30
              border-t-accent
            "
          />

          <p
            className="
              mt-5

              text-[9px]
              font-semibold
              uppercase
              tracking-[0.24em]

              text-muted

              sm:text-[10px]
            "
          >
            {locale === "tr"
              ? "Ürünler yükleniyor"
              : locale === "ar"
                ? "جارٍ تحميل المنتجات"
                : "Loading products"}
          </p>
        </div>
      </div>
    );
  }

  const activeProducts =
    products.filter(
      (product) =>
        product.isActive
    );

  const activeCategories =
    [...categories]
      .filter(
        (category) =>
          category.isActive
      )
      .sort(
        (a, b) =>
          a.order -
          b.order
      );

  return (
    <ProductsCatalog
      locale={locale}
      products={
        activeProducts
      }
      categories={
        activeCategories
      }
      dictionary={
        dictionary
      }
    />
  );
}