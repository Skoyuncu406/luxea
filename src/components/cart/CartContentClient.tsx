"use client";

import CartContent from "@/components/cart/CartContent";
import { useProducts } from "@/contexts/ProductContext";
import type { Locale } from "@/lib/i18n/config";

type CartPageDictionary = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  discoverProducts: string;
  productCount: string;
  clearCart: string;
  remove: string;
  color: string;
  quantity: string;
  subtotal: string;
  shippingNote: string;
  checkout: string;
  continueShopping: string;
};

type CartContentClientProps = {
  locale: Locale;
  dictionary: CartPageDictionary;
};

export default function CartContentClient({
  locale,
  dictionary,
}: CartContentClientProps) {
  const { products, isLoaded } = useProducts();

  if (!isLoaded) {
    return (
      <div className="mt-12 flex min-h-[420px] items-center justify-center border-y border-border px-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          {locale === "tr"
            ? "Sepet yükleniyor"
            : locale === "ar"
              ? "جارٍ تحميل سلة التسوق"
              : "Loading cart"}
        </p>
      </div>
    );
  }

  return (
    <CartContent
      locale={locale}
      products={products}
      dictionary={dictionary}
    />
  );
}