"use client";

import FavoritesContent from "@/components/favorites/FavoritesContent";
import { useProducts } from "@/contexts/ProductContext";
import type { Locale } from "@/lib/i18n/config";

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
  dictionary: FavoritesPageDictionary;
};

export default function FavoritesContentClient({
  locale,
  dictionary,
}: FavoritesContentClientProps) {
  const { products, isLoaded } = useProducts();

  if (!isLoaded) {
    return (
      <div className="mt-12 flex min-h-[420px] items-center justify-center border-y border-border px-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          {locale === "tr"
            ? "Favoriler yükleniyor"
            : locale === "ar"
              ? "جارٍ تحميل المفضلة"
              : "Loading favorites"}
        </p>
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