"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { useCart } from "@/contexts/CartContext";
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

const WHATSAPP_NUMBER =
  "905453577806";

const whatsappCopy = {
  tr: {
    priceInfo:
      "Fiyat Bilgisi Al",
    orderInfo:
      "Fiyat & Sipariş Bilgisi",
    description:
      "Sepetinizdeki ürünler için sipariş talebi oluşturabilir, teslimat ve iletişim bilgilerinizi bir sonraki adımda iletebilirsiniz.",
    button:
      "Sipariş Ver",
    note:
      "Sipariş formunda iletişim ve teslimat bilgilerinizi tamamladıktan sonra talebiniz firmaya iletilecektir.",
    messageTitle:
      "Merhaba LUXEA, aşağıdaki ürünler hakkında fiyat ve sipariş bilgisi almak istiyorum:",
  },
  en: {
    priceInfo:
      "Request Price",
    orderInfo:
      "Price & Order Information",
    description:
      "Create an order request for the products in your bag and provide your contact and delivery details in the next step.",
    button:
      "Place Order",
    note:
      "After completing your contact and delivery information, your order request will be sent to the company.",
    messageTitle:
      "Hello LUXEA, I would like price and order information for the following products:",
  },
  ar: {
    priceInfo:
      "طلب السعر",
    orderInfo:
      "معلومات السعر والطلب",
    description:
      "يمكنك إنشاء طلب للمنتجات الموجودة في سلتك وإدخال معلومات الاتصال والتوصيل في الخطوة التالية.",
    button:
      "إرسال الطلب",
    note:
      "بعد إكمال معلومات الاتصال والتوصيل سيتم إرسال طلبك إلى الشركة.",
    messageTitle:
      "مرحباً LUXEA، أود معرفة السعر ومعلومات الطلب للمنتجات التالية:",
  },
} as const;

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

  const copy =
    whatsappCopy[locale];

  if (!isLoaded) {
    return (
      <div className="mt-12 space-y-5">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="grid animate-pulse gap-5 border-b border-white/20 pb-6 sm:grid-cols-[140px_minmax(0,1fr)]"
          >
            <div className="aspect-[4/5] bg-[#E5E0D7]/18 backdrop-blur-[1px]" />

            <div className="py-2">
              <div className="h-8 w-2/3 bg-[#E5E0D7]/18 backdrop-blur-[1px]" />
              <div className="mt-4 h-4 w-1/3 bg-[#E5E0D7]/14 backdrop-blur-[1px]" />
              <div className="mt-8 h-12 w-40 bg-[#E5E0D7]/14 backdrop-blur-[1px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (resolvedCartItems.length === 0) {
    return (
      <div className="mt-6 flex min-h-[300px] flex-col items-center justify-center border-y border-white/20 px-5 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-[#E5E0D7]/10 backdrop-blur-[1px]">
          <ShoppingBag
            size={29}
            strokeWidth={1.1}
            className="text-accent"
          />
        </span>

        <h2 className="mt-5 font-heading text-[32px] font-semibold leading-[0.98] tracking-[-0.03em] text-foreground sm:text-[38px]">
          {dictionary.emptyTitle}
        </h2>

        <p className="mt-3 max-w-xl text-xs leading-6 text-foreground-soft sm:text-sm sm:leading-7">
          {dictionary.emptyDescription}
        </p>

        <Link
          href={`/${locale}/products`}
          className="group mt-5 inline-flex min-h-12 items-center justify-center gap-3 border border-foreground bg-foreground px-8 text-[10px] font-semibold uppercase tracking-[0.17em] !text-[#F3F0EA] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:!text-white"
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
    <div className="mt-8">
      {/* Sepet üst bilgisi */}
      <div className="flex min-h-[72px] flex-wrap items-center justify-between gap-5 border-y border-white/20">
        <p className="text-[10px] font-semibold uppercase tracking-[0.21em] text-muted">
          {cartCount} {dictionary.productCount}
        </p>

        <button
          type="button"
          onClick={clearCart}
          className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-foreground transition-colors duration-300 hover:text-danger"
        >
          <Trash2 size={13} strokeWidth={1.4} />

          <span>{dictionary.clearCart}</span>
        </button>
      </div>

      <div className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_410px]">
        {/* Sepetteki ürünler */}
        <div className="min-w-0">
          <div className="divide-y divide-border border-y border-white/20">
            {resolvedCartItems.map(({ cartItem, product }) => (
              <article
                key={cartItem.id}
                className="grid gap-5 py-6 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-7 lg:grid-cols-[170px_minmax(0,1fr)]"
              >
                {/* Görsel */}
                <Link
                  href={`/${locale}/products/${product.slug}`}
                  className="group/image relative aspect-[4/5] w-full overflow-hidden border border-white/20 bg-surface/45 shadow-[0_16px_38px_rgba(36,35,32,0.055)] sm:w-[150px] lg:w-[170px]"
                >
                  <Image
                    src={product.image}
                    alt={product.name[locale]}
                    fill
                    sizes="(max-width: 639px) 100vw, 170px"
                    className="object-cover object-center transition-transform duration-700 group-hover/image:scale-[1.025]"
                  />
                </Link>

                {/* Ürün bilgileri */}
                <div className="flex min-w-0 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <Link
                          href={`/${locale}/products/${product.slug}`}
                          className="font-heading text-[27px] font-semibold leading-[0.98] tracking-[-0.025em] text-foreground transition-all duration-300 hover:bg-accent/[0.06] hover:text-accent sm:text-[31px]"
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
                              className="h-4 w-4 rounded-full border border-black/15 shadow-[0_0_0_1px_rgba(255,255,255,0.22)]"
                              style={{
                                backgroundColor: cartItem.color,
                              }}
                            />
                          </div>

                          <a
                            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                              `${copy.messageTitle}\n\n${product.name[locale]}\n${dictionary.color}: ${cartItem.color}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-accent transition-colors duration-300 hover:text-foreground"
                          >
                            <MessageCircle
                              size={13}
                              strokeWidth={1.4}
                            />

                            <span>
                              {copy.priceInfo}
                            </span>
                          </a>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(cartItem.id)
                        }
                        aria-label={dictionary.remove}
                        title={dictionary.remove}
                        className="flex h-9 w-9 shrink-0 items-center justify-center border border-transparent text-muted transition-all duration-300 hover:border-danger/25 hover:bg-danger/[0.06] hover:text-danger"
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

                      <div className="inline-flex h-11 items-center border border-white/25 bg-[#E5E0D7]/10 backdrop-blur-[1px]">
                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(cartItem.id)
                          }
                          aria-label="-"
                          className="flex h-full w-11 items-center justify-center text-foreground transition-all duration-300 hover:bg-accent/[0.06] hover:text-accent"
                        >
                          <Minus size={13} strokeWidth={1.5} />
                        </button>

                        <span className="flex h-full min-w-11 items-center justify-center border-x border-white/25 text-sm font-medium">
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
                          className="flex h-full w-11 items-center justify-center text-foreground transition-all duration-300 hover:bg-accent/[0.06] hover:text-accent disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <Plus size={13} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {/* Fiyat bilgisi */}
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        `${copy.messageTitle}\n\n${product.name[locale]}\n${dictionary.color}: ${cartItem.color}\n${dictionary.quantity}: ${cartItem.quantity}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="group/price inline-flex min-h-10 items-center justify-center gap-2 border border-accent/30 bg-[#E5E0D7]/10 px-4 text-[8px] font-semibold uppercase tracking-[0.17em] backdrop-blur-[1px] text-accent transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-white"
                    >
                      <MessageCircle
                        size={13}
                        strokeWidth={1.4}
                      />

                      <span>
                        {copy.priceInfo}
                      </span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Link
            href={`/${locale}/products`}
            className="mt-7 inline-flex items-center gap-3.5 text-[9px] font-semibold uppercase tracking-[0.19em] text-foreground transition-all duration-300 hover:bg-accent/[0.06] hover:text-accent"
          >
            <span>←</span>
            <span>{dictionary.continueShopping}</span>
          </Link>
        </div>

        {/* Fiyat ve sipariş bilgisi */}
        <aside className="lg:sticky lg:top-[116px] lg:self-start">
          <div className="border border-white/25 bg-[#E5E0D7]/12 p-6 shadow-[0_22px_55px_rgba(36,35,32,0.055)] backdrop-blur-[2px] sm:p-8">
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-accent">
              LUXEA
            </p>

            <h2 className="mt-3 font-heading text-4xl font-semibold leading-[0.98] tracking-[-0.03em] text-foreground">
              {copy.orderInfo}
            </h2>

            <p className="mt-6 text-sm leading-7 text-foreground-soft">
              {copy.description}
            </p>

            <div className="mt-7 border-y border-white/20 py-6">
              <p className="text-[9px] font-semibold uppercase tracking-[0.19em] text-muted">
                {cartCount} {dictionary.productCount}
              </p>

              <p className="mt-3 text-xs leading-6 text-foreground-soft">
                {copy.note}
              </p>
            </div>

            <Link
              href={`/${locale}/checkout`}
              className="group mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 border border-[#242320] bg-[#242320] px-7 text-center shadow-[0_12px_28px_rgba(36,35,32,0.12)] text-[10px] font-semibold uppercase tracking-[0.17em] !text-[#F3F0EA] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:!text-white"
            >
              <ShoppingBag
                size={17}
                strokeWidth={1.4}
                className="transition-transform duration-300 group-hover:scale-105"
              />

              <span>
                {copy.button}
              </span>

              <ArrowUpRight
                size={15}
                strokeWidth={1.4}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}