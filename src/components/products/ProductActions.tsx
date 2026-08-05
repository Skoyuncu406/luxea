"use client";

import { useState } from "react";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";

import { useFavorites } from "@/contexts/FavoritesContext";
import { formatPrice } from "@/lib/format-price";
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent sm:text-[11px]">
        LUXEA
      </p>

      <h1 className="mt-4 font-heading text-5xl leading-[0.95] text-foreground sm:text-6xl lg:text-[64px] xl:text-7xl">
        {product.name[locale]}
      </h1>

      <p className="mt-6 text-lg font-semibold tracking-[0.04em] text-foreground">
        {formatPrice(
          product.price,
          product.currency,
          locale
        )}
      </p>

      <p className="mt-6 text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
        {product.shortDescription[locale]}
      </p>

      {/* Renk seçimi */}
      <div className="mt-9 border-y border-border py-6">
        <div className="flex items-center justify-between gap-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
            {dictionary.color}
          </p>

          <p className="text-end text-[10px] uppercase tracking-[0.16em] text-muted">
            {dictionary.selectColor}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
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
                  "relative flex h-10 w-10 items-center justify-center rounded-full border",
                  "transition-all duration-300",
                  colorIsSelected
                    ? "border-foreground shadow-[0_0_0_2px_rgba(229,224,215,1),0_0_0_3px_rgba(36,35,32,0.45)]"
                    : "border-border hover:border-foreground",
                ].join(" ")}
              >
                <span
                  className="h-6 w-6 rounded-full border border-black/10"
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
      <div className="border-b border-border py-6">
        <div className="flex items-center justify-between gap-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
            {dictionary.quantity}
          </p>

          <p
            className={[
              "text-[10px] uppercase tracking-[0.16em]",
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

        <div className="mt-5 inline-flex h-12 items-center border border-border">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={quantity <= 1 || isOutOfStock}
            aria-label={dictionary.decrease}
            className="flex h-full w-12 items-center justify-center text-foreground transition-colors duration-300 hover:text-accent disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Minus size={14} strokeWidth={1.5} />
          </button>

          <span className="flex h-full min-w-12 items-center justify-center border-x border-border text-sm">
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
            className="flex h-full w-12 items-center justify-center text-foreground transition-colors duration-300 hover:text-accent disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Plus size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Sepet ve favori */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
       <button
  type="button"
  onClick={handleAddToCart}
  disabled={isOutOfStock || !selectedColor}
  className={[
    "inline-flex min-h-14 flex-1 items-center justify-center gap-3",
    "border px-7 text-[10px] font-semibold uppercase tracking-[0.16em]",
    "transition-all duration-300",
    isAddedToCart
      ? "border-accent bg-accent !text-white"
      : !isOutOfStock && selectedColor
        ? "border-[#242320] bg-[#242320] !text-[#F3F0EA] hover:border-[#92734A] hover:bg-[#92734A] hover:!text-white"
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
            "inline-flex min-h-14 min-w-14 items-center justify-center border",
            "transition-all duration-300",
            productIsFavorite
              ? "border-accent bg-accent text-white hover:border-accent-dark hover:bg-accent-dark"
              : "border-foreground text-foreground hover:bg-foreground hover:!text-[#F3F0EA]",
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
      <div className="mt-9 divide-y divide-border border-y border-border">
        <details className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[10px] font-semibold uppercase tracking-[0.17em]">
            <span>{dictionary.details}</span>

            <Plus
              size={15}
              strokeWidth={1.4}
              className="shrink-0 transition-transform duration-300 group-open:rotate-45"
            />
          </summary>

          <p className="pt-4 text-sm leading-7 text-foreground-soft">
            {dictionary.detailsText}
          </p>
        </details>

        <details className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[10px] font-semibold uppercase tracking-[0.17em]">
            <span>{dictionary.shipping}</span>

            <Plus
              size={15}
              strokeWidth={1.4}
              className="shrink-0 transition-transform duration-300 group-open:rotate-45"
            />
          </summary>

          <p className="pt-4 text-sm leading-7 text-foreground-soft">
            {dictionary.shippingText}
          </p>
        </details>

        <details className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[10px] font-semibold uppercase tracking-[0.17em]">
            <span>{dictionary.returns}</span>

            <Plus
              size={15}
              strokeWidth={1.4}
              className="shrink-0 transition-transform duration-300 group-open:rotate-45"
            />
          </summary>

          <p className="pt-4 text-sm leading-7 text-foreground-soft">
            {dictionary.returnsText}
          </p>
        </details>
      </div>
    </div>
  );
}