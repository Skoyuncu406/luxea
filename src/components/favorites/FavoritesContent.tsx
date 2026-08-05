"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Heart,
  Trash2,
} from "lucide-react";

import { useFavorites } from "@/contexts/FavoritesContext";
import { formatPrice } from "@/lib/format-price";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/types/product";

type FavoritesDictionary = {
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

type FavoritesContentProps = {
  locale: Locale;
  products: Product[];
  dictionary: FavoritesDictionary;
};

export default function FavoritesContent({
  locale,
  products,
  dictionary,
}: FavoritesContentProps) {
  const {
    favoriteIds,
    favoriteCount,
    isLoaded,
    removeFavorite,
    clearFavorites,
  } = useFavorites();

  const favoriteProducts = products
    .filter(
      (product) =>
        product.isActive &&
        favoriteIds.includes(product.id)
    )
    .sort((a, b) => a.order - b.order);

  if (!isLoaded) {
    return (
      <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="animate-pulse"
            >
              <div className="aspect-[4/5] bg-surface-strong/50" />

              <div className="mt-5 h-7 w-2/3 bg-surface-strong/50" />

              <div className="mt-3 h-4 w-1/3 bg-surface-strong/40" />
            </div>
          )
        )}
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="mt-12 flex min-h-[460px] flex-col items-center justify-center border-y border-border px-5 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface/50">
          <Heart
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
      <div className="flex min-h-[72px] flex-wrap items-center justify-between gap-5 border-y border-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          {favoriteCount} {dictionary.productCount}
        </p>

        <button
          type="button"
          onClick={clearFavorites}
          className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors duration-300 hover:text-danger"
        >
          <Trash2 size={13} strokeWidth={1.4} />

          <span>{dictionary.clearAll}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-16 pt-10 sm:grid-cols-2 sm:pt-12 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-20 xl:grid-cols-4 xl:gap-x-9">
        {favoriteProducts.map((product) => (
          <article
            key={product.id}
            className="group min-w-0"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-surface">
              <Link
                href={`/${locale}/products/${product.slug}`}
                aria-label={product.name[locale]}
                className="absolute inset-0 z-10"
              />

              <Image
                src={product.image}
                alt={product.name[locale]}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className={[
                  "object-cover transition-all duration-700 ease-out",
                  product.hoverImage
                    ? "group-hover:scale-[1.025] group-hover:opacity-0"
                    : "group-hover:scale-[1.035]",
                ].join(" ")}
              />

              {product.hoverImage && (
                <Image
                  src={product.hoverImage}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.025] group-hover:opacity-100"
                />
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#242320]/20 via-transparent to-transparent" />

              <button
                type="button"
                onClick={() =>
                  removeFavorite(product.id)
                }
                aria-label={dictionary.remove}
                title={dictionary.remove}
                className="absolute end-4 top-4 z-30 flex h-10 w-10 items-center justify-center border border-accent bg-accent text-white transition-all duration-300 hover:border-danger hover:bg-danger"
              >
                <Heart
                  size={17}
                  strokeWidth={1.4}
                  fill="currentColor"
                />
              </button>

              <span className="pointer-events-none absolute inset-x-4 bottom-4 z-20 translate-y-3 border border-white/45 bg-[#E5E0D7]/92 px-4 py-3 text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-foreground opacity-0 backdrop-blur-xl transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                {dictionary.viewProduct}
              </span>
            </div>

            <Link
              href={`/${locale}/products/${product.slug}`}
              className="block"
            >
              <div className="border-b border-border pb-6 pt-5">
                <div className="flex items-start justify-between gap-5">
                  <h2 className="min-w-0 font-heading text-[27px] leading-[1.02] text-foreground transition-colors duration-300 group-hover:text-accent lg:text-[29px]">
                    {product.name[locale]}
                  </h2>

                  <p className="shrink-0 pt-1 text-[11px] font-semibold tracking-[0.07em] text-foreground">
                    {formatPrice(
                      product.price,
                      product.currency,
                      locale
                    )}
                  </p>
                </div>

                <p className="mt-3 line-clamp-2 text-xs leading-6 text-foreground-soft">
                  {product.shortDescription[locale]}
                </p>

                <div className="mt-5 flex items-center gap-2.5">
                  {product.colors.map((color) => (
                    <span
                      key={color}
                      aria-hidden="true"
                      className="h-3.5 w-3.5 rounded-full border border-black/15"
                      style={{
                        backgroundColor: color,
                      }}
                    />
                  ))}
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}