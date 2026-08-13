"use client";

import CartContent from "@/components/cart/CartContent";

import {
  useProducts,
} from "@/contexts/ProductContext";

import type {
  Locale,
} from "@/lib/i18n/config";

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
  dictionary:
    CartPageDictionary;
};

export default function CartContentClient({
  locale,
  dictionary,
}: CartContentClientProps) {
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
              ? "Sepet yükleniyor"
              : locale === "ar"
                ? "جارٍ تحميل سلة التسوق"
                : "Loading cart"}
          </p>
        </div>
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