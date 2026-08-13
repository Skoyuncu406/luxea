"use client";

import FavoritesContent from "@/components/favorites/FavoritesContent";
import { useProducts } from "@/contexts/ProductContext";

import type {
  Locale,
} from "@/lib/i18n/config";

type FavoritesPageDictionary = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  discoverProducts: string;
  remove: string;
  clearAll: string;
  productCount: string;
  viewProduct: string;
};

type FavoritesContentClientProps = {
  locale: Locale;
  dictionary:
    FavoritesPageDictionary;
};

export default function FavoritesContentClient({
  locale,
  dictionary,
}: FavoritesContentClientProps) {
  const {
    products,
    isLoaded,
  } = useProducts();

  if (!isLoaded) {
    return (
      <div
        className="
          mt-10
          flex
          min-h-[360px]
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
              ? "Favoriler yükleniyor"
              : locale === "ar"
                ? "جارٍ تحميل المفضلة"
                : "Loading favorites"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <FavoritesContent
      locale={locale}
      products={products}
      dictionary={dictionary}
    />
  );
}