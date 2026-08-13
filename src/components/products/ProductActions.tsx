"use client";

import { useState } from "react";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";

import { useFavorites } from "@/contexts/FavoritesContext";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";

type ProductActionsDictionary = {
  addedToCart: string;
  color: string;
  selectColor: string;
  quantity: string;
  inStock: string;
  outOfStock: string;
  decrease: string;
  increase: string;
  addToCart: string;
  addToFavorites: string;
  details: string;
  detailsText: string;
  shipping: string;
  shippingText: string;
  returns: string;
  returnsText: string;
};

type ProductActionsProps = {
  locale: Locale;
  product: Product;
  dictionary: ProductActionsDictionary;
};

export default function ProductActions({
  locale,
  product,
  dictionary,
}: ProductActionsProps) {
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0] ?? ""
  );
  const [quantity, setQuantity] = useState(1);

  const {
    isFavorite,
    toggleFavorite,
  } = useFavorites();

  

  const productIsFavorite = isFavorite(product.id);
  const isOutOfStock = product.stock <= 0;

  const { addToCart } = useCart();
const [isAddedToCart, setIsAddedToCart] = useState(false);

  const whatsappLabel =
    locale === "tr"
      ? "Fiyat Bilgisi Al"
      : locale === "ar"
        ? "احصل على السعر"
        : "Get Price";

  const whatsappHint =
    locale === "tr"
      ? "Güncel fiyat ve ürün detayları için WhatsApp üzerinden bize ulaşın."
      : locale === "ar"
        ? "تواصل معنا عبر واتساب للحصول على السعر الحالي وتفاصيل المنتج."
        : "Contact us on WhatsApp for current pricing and product details.";

  const whatsappMessage =
    locale === "tr"
      ? `Merhaba, ${product.name[locale]} ürünü hakkında fiyat bilgisi almak istiyorum.${selectedColor ? ` Seçtiğim renk: ${selectedColor}.` : ""}`
      : locale === "ar"
        ? `مرحبًا، أود الحصول على معلومات السعر لمنتج ${product.name[locale]}.${selectedColor ? ` اللون الذي اخترته: ${selectedColor}.` : ""}`
        : `Hello, I would like to get pricing information for ${product.name[locale]}.${selectedColor ? ` Selected color: ${selectedColor}.` : ""}`;

  const whatsappUrl =
    `https://wa.me/905453577806?text=${encodeURIComponent(
      whatsappMessage
    )}`;


function handleAddToCart() {
  if (
    isOutOfStock ||
    !selectedColor ||
    quantity <= 0
  ) {
    return;
  }

  addToCart({
    productId: product.id,
    color: selectedColor,
    quantity,
    stock: product.stock,
  });

  setIsAddedToCart(true);

  window.setTimeout(() => {
    setIsAddedToCart(false);
  }, 1600);
}

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(product.stock, current + 1)
    );
  }

  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-accent sm:text-[10px]">
        LUXEA
      </p>

      <h1 className="mt-4 font-heading text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-[62px] xl:text-[68px]">
        {product.name[locale]}
      </h1>

      <p className="mt-6 max-w-[560px] text-sm leading-7 text-foreground-soft sm:text-[15px] sm:leading-8">
        {product.shortDescription[locale]}
      </p>

      {/* Fiyat bilgisi / WhatsApp */}
      <div className="relative mt-9 overflow-hidden border border-accent/30 bg-[#E5E0D7]/12 p-5 backdrop-blur-[1px] sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-12 -top-14 h-36 w-36 rounded-full bg-accent/[0.08] blur-3xl"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-[430px]">
            <p className="text-[8px] font-semibold uppercase tracking-[0.26em] text-accent sm:text-[9px]">
              LUXEA PRIVATE SERVICE
            </p>

            <p className="mt-2.5 text-[11px] leading-6 text-foreground-soft sm:text-xs">
              {whatsappHint}
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className={[
              "group relative inline-flex min-h-14 shrink-0 overflow-hidden",
              "items-center justify-center gap-3",
              "border border-accent bg-accent px-6 shadow-[0_12px_30px_rgba(112,86,56,0.12)]",
              "text-[9px] font-semibold uppercase tracking-[0.16em]",
              "!text-white",
              "transition-all duration-300 ease-out",
              "hover:border-accent-dark hover:bg-accent-dark",
              "hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(112,86,56,0.18)]",
            ].join(" ")}
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 -left-16 w-10 -skew-x-12 bg-white/20 blur-sm transition-all duration-700 group-hover:left-[120%]"
            />

            <MessageCircle
              size={16}
              strokeWidth={1.45}
              className="relative transition-transform duration-300 group-hover:scale-110"
            />

            <span className="relative">
              {whatsappLabel}
            </span>

            <ArrowUpRight
              size={14}
              strokeWidth={1.4}
              className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
            />
          </a>
        </div>
      </div>

      {/* Renk seçimi */}
      <div className="mt-9 border-y border-white/20 py-6">
        <div className="flex items-center justify-between gap-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground sm:text-[10px]">
            {dictionary.color}
          </p>

          <p className="text-end text-[9px] uppercase tracking-[0.17em] text-muted sm:text-[10px]">
            {dictionary.selectColor}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3.5">
          {product.colors.map((color, index) => {
            const colorIsSelected =
              selectedColor === color;

            return (
              <button
                key={`${color}-${index}`}
                type="button"
                onClick={() => setSelectedColor(color)}
                aria-label={`${dictionary.color} ${index + 1}`}
                aria-pressed={colorIsSelected}
                className={[
                  "relative flex h-11 w-11 items-center justify-center rounded-full border",
                  "transition-all duration-300 ease-out",
                  colorIsSelected
                    ? "border-accent shadow-[0_0_0_3px_rgba(229,224,215,0.95),0_0_0_4px_rgba(146,115,74,0.65)]"
                    : "border-white/30 hover:border-accent/70",
                ].join(" ")}
              >
                <span
                  className="h-6 w-6 rounded-full border border-black/10 shadow-[0_2px_8px_rgba(36,35,32,0.08)]"
                  style={{
                    backgroundColor: color,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Adet */}
      <div className="border-b border-white/20 py-6">
        <div className="flex items-center justify-between gap-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground sm:text-[10px]">
            {dictionary.quantity}
          </p>

          <p
            className={[
              "text-[9px] uppercase tracking-[0.17em] sm:text-[10px]",
              isOutOfStock
                ? "text-danger"
                : "text-muted",
            ].join(" ")}
          >
            {isOutOfStock
              ? dictionary.outOfStock
              : dictionary.inStock}
          </p>
        </div>

        <div className="mt-5 inline-flex h-12 items-center border border-white/25 bg-[#E5E0D7]/10 backdrop-blur-[1px]">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={quantity <= 1 || isOutOfStock}
            aria-label={dictionary.decrease}
            className="flex h-full w-12 items-center justify-center text-foreground transition-all duration-300 hover:bg-accent/[0.06] hover:text-accent disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Minus size={14} strokeWidth={1.5} />
          </button>

          <span className="flex h-full min-w-12 items-center justify-center border-x border-white/25 text-sm font-medium">
            {quantity}
          </span>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={
              isOutOfStock ||
              quantity >= product.stock
            }
            aria-label={dictionary.increase}
            className="flex h-full w-12 items-center justify-center text-foreground transition-all duration-300 hover:bg-accent/[0.06] hover:text-accent disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Plus size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Sepet ve favori */}
      <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
       <button
  type="button"
  onClick={handleAddToCart}
  disabled={isOutOfStock || !selectedColor}
  className={[
    "inline-flex min-h-14 flex-1 items-center justify-center gap-3 overflow-hidden",
    "border px-7 text-[10px] font-semibold uppercase tracking-[0.16em]",
    "transition-all duration-300 ease-out",
    isAddedToCart
      ? "border-accent bg-accent !text-white shadow-[0_12px_30px_rgba(146,115,74,0.16)]"
      : !isOutOfStock && selectedColor
        ? "border-[#242320] bg-[#242320] !text-[#F3F0EA] shadow-[0_12px_28px_rgba(36,35,32,0.12)] hover:-translate-y-0.5 hover:border-[#92734A] hover:bg-[#92734A] hover:!text-white hover:shadow-[0_16px_34px_rgba(146,115,74,0.16)]"
        : "cursor-not-allowed border-border bg-surface-strong text-muted",
  ].join(" ")}
>
  <ShoppingBag size={17} strokeWidth={1.4} />

  <span>
    {isAddedToCart
      ? dictionary.addedToCart
      : dictionary.addToCart}
  </span>
</button>

        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-label={
            productIsFavorite
              ? dictionary.addToFavorites
              : dictionary.addToFavorites
          }
          aria-pressed={productIsFavorite}
          title={dictionary.addToFavorites}
          className={[
            "inline-flex min-h-14 min-w-14 items-center justify-center border bg-[#E5E0D7]/8 backdrop-blur-[1px]",
            "transition-all duration-300 ease-out",
            productIsFavorite
              ? "border-accent bg-accent text-white shadow-[0_10px_24px_rgba(146,115,74,0.14)] hover:border-accent-dark hover:bg-accent-dark"
              : "border-foreground/80 text-foreground hover:-translate-y-0.5 hover:bg-foreground hover:!text-[#F3F0EA]",
          ].join(" ")}
        >
          <Heart
            size={18}
            strokeWidth={1.4}
            fill={
              productIsFavorite
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </div>

      {/* Bilgi alanları */}
      <div className="mt-10 divide-y divide-white/20 border-y border-white/20">
        <details className="group py-[22px]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[9px] font-semibold uppercase tracking-[0.19em] text-foreground transition-colors duration-300 hover:text-accent sm:text-[10px]">
            <span>{dictionary.details}</span>

            <Plus
              size={15}
              strokeWidth={1.4}
              className="shrink-0 transition-transform duration-300 group-open:rotate-45"
            />
          </summary>

          <p className="max-w-[560px] pt-4 text-[13px] leading-7 text-foreground-soft sm:text-sm">
            {dictionary.detailsText}
          </p>
        </details>

        <details className="group py-[22px]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[9px] font-semibold uppercase tracking-[0.19em] text-foreground transition-colors duration-300 hover:text-accent sm:text-[10px]">
            <span>{dictionary.shipping}</span>

            <Plus
              size={15}
              strokeWidth={1.4}
              className="shrink-0 transition-transform duration-300 group-open:rotate-45"
            />
          </summary>

          <p className="max-w-[560px] pt-4 text-[13px] leading-7 text-foreground-soft sm:text-sm">
            {dictionary.shippingText}
          </p>
        </details>

        <details className="group py-[22px]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[9px] font-semibold uppercase tracking-[0.19em] text-foreground transition-colors duration-300 hover:text-accent sm:text-[10px]">
            <span>{dictionary.returns}</span>

            <Plus
              size={15}
              strokeWidth={1.4}
              className="shrink-0 transition-transform duration-300 group-open:rotate-45"
            />
          </summary>

          <p className="max-w-[560px] pt-4 text-[13px] leading-7 text-foreground-soft sm:text-sm">
            {dictionary.returnsText}
          </p>
        </details>
      </div>
    </div>
  );
}