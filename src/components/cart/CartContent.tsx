"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/format-price";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/types/product";

type CartDictionary = {
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

type CartContentProps = {
  locale: Locale;
  products: Product[];
  dictionary: CartDictionary;
};

export default function CartContent({
  locale,
  products,
  dictionary,
}: CartContentProps) {
  const {
    cartItems,
    cartCount,
    isLoaded,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();

  const resolvedCartItems = cartItems
    .map((cartItem) => {
      const product = products.find(
        (currentProduct) =>
          currentProduct.id === cartItem.productId &&
          currentProduct.isActive
      );

      if (!product) {
        return null;
      }

      return {
        cartItem,
        product,
      };
    })
    .filter(
      (
        item
      ): item is {
        cartItem: (typeof cartItems)[number];
        product: Product;
      } => item !== null
    );

  const subtotal = resolvedCartItems.reduce(
    (total, { cartItem, product }) =>
      total + product.price * cartItem.quantity,
    0
  );

  const currency =
    resolvedCartItems[0]?.product.currency ?? "USD";

  if (!isLoaded) {
    return (
      <div className="mt-12 space-y-5">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="grid animate-pulse gap-5 border-b border-border pb-6 sm:grid-cols-[140px_minmax(0,1fr)]"
          >
            <div className="aspect-[4/5] bg-surface-strong/50" />

            <div className="py-2">
              <div className="h-8 w-2/3 bg-surface-strong/50" />
              <div className="mt-4 h-4 w-1/3 bg-surface-strong/40" />
              <div className="mt-8 h-12 w-40 bg-surface-strong/40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (resolvedCartItems.length === 0) {
    return (
      <div className="mt-12 flex min-h-[480px] flex-col items-center justify-center border-y border-border px-5 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface/50">
          <ShoppingBag
            size={29}
            strokeWidth={1.1}
            className="text-accent"
          />
        </span>

        <h2 className="mt-8 font-heading text-4xl leading-none text-foreground sm:text-5xl">
          {dictionary.emptyTitle}
        </h2>

        <p className="mt-5 max-w-xl text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
          {dictionary.emptyDescription}
        </p>

        <Link
          href={`/${locale}/products`}
          className="group mt-9 inline-flex min-h-14 items-center justify-center gap-4 border border-foreground bg-foreground px-8 text-[10px] font-semibold uppercase tracking-[0.17em] !text-[#F3F0EA] transition-all duration-300 hover:border-accent hover:bg-accent hover:!text-white"
        >
          <span>{dictionary.discoverProducts}</span>

          <ArrowUpRight
            size={15}
            strokeWidth={1.4}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
          />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12">
      {/* Sepet üst bilgisi */}
      <div className="flex min-h-[72px] flex-wrap items-center justify-between gap-5 border-y border-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          {cartCount} {dictionary.productCount}
        </p>

        <button
          type="button"
          onClick={clearCart}
          className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors duration-300 hover:text-danger"
        >
          <Trash2 size={13} strokeWidth={1.4} />

          <span>{dictionary.clearCart}</span>
        </button>
      </div>

      <div className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* Sepetteki ürünler */}
        <div className="min-w-0">
          <div className="divide-y divide-border border-y border-border">
            {resolvedCartItems.map(({ cartItem, product }) => (
              <article
                key={cartItem.id}
                className="grid gap-5 py-6 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-7 lg:grid-cols-[170px_minmax(0,1fr)]"
              >
                {/* Görsel */}
                <Link
                  href={`/${locale}/products/${product.slug}`}
                  className="group/image relative aspect-[4/5] w-full overflow-hidden bg-surface sm:w-[150px] lg:w-[170px]"
                >
                  <Image
                    src={product.image}
                    alt={product.name[locale]}
                    fill
                    sizes="(max-width: 639px) 100vw, 170px"
                    className="object-cover object-center transition-transform duration-700 group-hover/image:scale-[1.04]"
                  />
                </Link>

                {/* Ürün bilgileri */}
                <div className="flex min-w-0 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <Link
                          href={`/${locale}/products/${product.slug}`}
                          className="font-heading text-[28px] leading-none text-foreground transition-colors duration-300 hover:text-accent sm:text-[32px]"
                        >
                          {product.name[locale]}
                        </Link>

                        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted">
                              {dictionary.color}
                            </span>

                            <span
                              aria-hidden="true"
                              className="h-4 w-4 rounded-full border border-black/15"
                              style={{
                                backgroundColor: cartItem.color,
                              }}
                            />
                          </div>

                          <p className="text-[10px] font-semibold tracking-[0.06em] text-foreground">
                            {formatPrice(
                              product.price,
                              product.currency,
                              locale
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(cartItem.id)
                        }
                        aria-label={dictionary.remove}
                        title={dictionary.remove}
                        className="flex h-9 w-9 shrink-0 items-center justify-center text-muted transition-colors duration-300 hover:text-danger"
                      >
                        <Trash2 size={16} strokeWidth={1.35} />
                      </button>
                    </div>

                    <p className="mt-5 line-clamp-2 max-w-xl text-xs leading-6 text-foreground-soft">
                      {product.shortDescription[locale]}
                    </p>
                  </div>

                  <div className="mt-7 flex flex-wrap items-end justify-between gap-5">
                    {/* Adet kontrolü */}
                    <div>
                      <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted">
                        {dictionary.quantity}
                      </p>

                      <div className="inline-flex h-11 items-center border border-border">
                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(cartItem.id)
                          }
                          aria-label="-"
                          className="flex h-full w-11 items-center justify-center text-foreground transition-colors duration-300 hover:text-accent"
                        >
                          <Minus size={13} strokeWidth={1.5} />
                        </button>

                        <span className="flex h-full min-w-11 items-center justify-center border-x border-border text-sm">
                          {cartItem.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(
                              cartItem.id,
                              product.stock
                            )
                          }
                          disabled={
                            cartItem.quantity >= product.stock
                          }
                          aria-label="+"
                          className="flex h-full w-11 items-center justify-center text-foreground transition-colors duration-300 hover:text-accent disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <Plus size={13} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {/* Satır toplamı */}
                    <p className="text-sm font-semibold tracking-[0.05em] text-foreground">
                      {formatPrice(
                        product.price * cartItem.quantity,
                        product.currency,
                        locale
                      )}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Link
            href={`/${locale}/products`}
            className="mt-7 inline-flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.17em] text-foreground transition-colors duration-300 hover:text-accent"
          >
            <span>←</span>
            <span>{dictionary.continueShopping}</span>
          </Link>
        </div>

        {/* Sipariş özeti */}
        <aside className="lg:sticky lg:top-[116px] lg:self-start">
          <div className="border border-border bg-surface/55 p-6 sm:p-8">
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-accent">
              LUXEA
            </p>

            <h2 className="mt-3 font-heading text-4xl leading-none text-foreground">
              {dictionary.subtotal}
            </h2>

            <div className="mt-8 flex items-center justify-between gap-6 border-y border-border py-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                {dictionary.subtotal}
              </span>

              <strong className="text-lg font-semibold tracking-[0.04em] text-foreground">
                {formatPrice(subtotal, currency, locale)}
              </strong>
            </div>

            <p className="mt-5 text-xs leading-6 text-foreground-soft">
              {dictionary.shippingNote}
            </p>

            <Link
              href={`/${locale}/checkout`}
              className="mt-8 inline-flex min-h-14 w-full items-center justify-center border border-[#242320] bg-[#242320] px-7 text-[10px] font-semibold uppercase tracking-[0.17em] !text-[#F3F0EA] transition-all duration-300 hover:border-accent hover:bg-accent hover:!text-white"
            >
              {dictionary.checkout}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}