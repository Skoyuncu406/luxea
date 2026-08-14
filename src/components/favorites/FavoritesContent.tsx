"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  Heart,
  MessageCircle,
  Trash2,
} from "lucide-react";

import MobileProductSlider from "@/components/products/MobileProductSlider";

import {
  useFavorites,
} from "@/contexts/FavoritesContext";

import type {
  Locale,
} from "@/lib/i18n/config";

import type {
  Product,
} from "@/types/product";

/*
 * =============================================================
 * TYPES
 * =============================================================
 */

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

  dictionary:
    FavoritesDictionary;
};

/*
 * =============================================================
 * WHATSAPP
 * =============================================================
 */

const WHATSAPP_NUMBER =
  "905453577806";

/*
 * =============================================================
 * LOCAL COPY
 * =============================================================
 */

const whatsappCopy = {
  tr: {
    priceInfo:
      "Fiyat Bilgisi Al",

    message:
      "Merhaba LUXEA, {product} ürünü hakkında fiyat ve sipariş bilgisi almak istiyorum.",
  },

  en: {
    priceInfo:
      "Request Price",

    message:
      "Hello LUXEA, I would like to get price and order information about {product}.",
  },

  ar: {
    priceInfo:
      "طلب السعر",

    message:
      "مرحباً LUXEA، أود الحصول على معلومات السعر والطلب لمنتج {product}.",
  },
} as const;

/*
 * =============================================================
 * COMPONENT
 * =============================================================
 */

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

  const copy =
    whatsappCopy[locale];

  /*
   * ===========================================================
   * FAVORITE PRODUCTS
   * ===========================================================
   */

  const favoriteProducts =
    products
      .filter(
        (product) =>
          product.isActive &&
          favoriteIds.includes(
            product.id
          )
      )
      .sort(
        (a, b) =>
          a.order - b.order
      );

  /*
   * ===========================================================
   * WHATSAPP URL
   * ===========================================================
   */

  function getWhatsAppUrl(
    productName: string
  ) {
    const message =
      copy.message.replace(
        "{product}",
        productName
      );

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;
  }

  /*
   * ===========================================================
   * LOADING
   * ===========================================================
   */

  if (!isLoaded) {
    return (
      <div
        className="
          mt-6
          grid
          grid-cols-1
          gap-x-6
          gap-y-14
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
      >
        {Array.from({
          length: 4,
        }).map(
          (
            _,
            index
          ) => (
            <div
              key={index}
              className="animate-pulse"
            >
              <div
                className="
                  aspect-[4/5]
                  bg-[#E5E0D7]/18 backdrop-blur-[1px]
                "
              />

              <div
                className="
                  mt-5
                  h-7
                  w-2/3
                  bg-[#E5E0D7]/18 backdrop-blur-[1px]
                "
              />

              <div
                className="
                  mt-3
                  h-4
                  w-1/3
                  bg-[#E5E0D7]/14 backdrop-blur-[1px]
                "
              />
            </div>
          )
        )}
      </div>
    );
  }

  /*
   * ===========================================================
   * EMPTY STATE
   * ===========================================================
   */

  if (
    favoriteProducts.length ===
    0
  ) {
    return (
      <div
        className="
          mt-12
          flex
          min-h-[300px]
          flex-col
          items-center
          justify-center
          border-y
          border-white/20
          px-5
          text-center
        "
      >
        <span
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            border
            border-white/25
            bg-[#E5E0D7]/10
            backdrop-blur-[1px]
          "
        >
          <Heart
            size={29}
            strokeWidth={1.1}
            className="text-accent"
          />
        </span>

        <h2
          className="
            mt-5
            font-heading
            text-[32px]
            font-semibold
            leading-[0.98]
            tracking-[-0.03em]
            text-foreground
            sm:text-[38px]
          "
        >
          {
            dictionary.emptyTitle
          }
        </h2>

        <p
          className="
            mt-3
            max-w-xl
            text-xs
            leading-6
            text-foreground-soft
            sm:text-sm
            sm:leading-7
          "
        >
          {
            dictionary.emptyDescription
          }
        </p>

        <Link
          href={`/${locale}/products`}
          className="
            group
            mt-6
            inline-flex
            min-h-12
            items-center
            justify-center
            gap-4
            border
            border-foreground
            bg-foreground
            px-8
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.17em]
            !text-[#F3F0EA]
            transition-all
            duration-300
            ease-out
            hover:-translate-y-0.5
            hover:border-accent
            hover:bg-accent
            hover:!text-white
          "
        >
          <span>
            {
              dictionary.discoverProducts
            }
          </span>

          <ArrowUpRight
            size={15}
            strokeWidth={1.4}
            className="
              transition-transform
              duration-300
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
              rtl:group-hover:-translate-x-0.5
            "
          />
        </Link>
      </div>
    );
  }

  /*
   * ===========================================================
   * RENDER
   * ===========================================================
   */

  return (
    <div className="mt-8">
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div
        className="
          flex
          min-h-[72px]
          flex-wrap
          items-center
          justify-between
          gap-5
          border-y
          border-white/20
        "
      >
        <p
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.21em]
            text-muted
          "
        >
          {favoriteCount}{" "}
          {
            dictionary.productCount
          }
        </p>

        <button
          type="button"
          onClick={
            clearFavorites
          }
          className="
            inline-flex
            items-center
            gap-2
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-foreground
            transition-colors
            duration-300
            hover:text-danger
          "
        >
          <Trash2
            size={13}
            strokeWidth={1.4}
          />

          <span>
            {
              dictionary.clearAll
            }
          </span>
        </button>
      </div>

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <MobileProductSlider
        className="pt-10 sm:pt-12"
        desktopClassName="sm:grid-cols-2 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-16 xl:grid-cols-4 xl:gap-x-8"
      >
        {favoriteProducts.map(
          (product) => {
            const productName =
              product.name[
                locale
              ];

            const whatsappUrl =
              getWhatsAppUrl(
                productName
              );

            return (
              <article
                key={
                  product.id
                }
                className="
                  group
                  min-w-0
                "
              >
                {/* =========================================
                    IMAGE
                ========================================= */}

                <div
                  className="
                    relative
                    aspect-[4/5]
                    overflow-hidden
                    border border-white/20
                    bg-surface/45
                    shadow-[0_18px_45px_rgba(36,35,32,0.055)]
                  "
                >
                  <Link
                    href={`/${locale}/products/${product.slug}`}
                    aria-label={
                      productName
                    }
                    className="
                      absolute
                      inset-0
                      z-10
                    "
                  />

                  <Image
                    src={
                      product.image
                    }
                    alt={
                      productName
                    }
                    fill
                    sizes="
                      (max-width: 640px) 100vw,
                      (max-width: 1024px) 50vw,
                      (max-width: 1280px) 33vw,
                      25vw
                    "
                    className={[
                      "object-cover",
                      "transition-all",
                      "duration-700",
                      "ease-out",

                      product.hoverImage
                        ? "group-hover:scale-[1.018] group-hover:opacity-0"
                        : "group-hover:scale-[1.025]",
                    ].join(
                      " "
                    )}
                  />

                  {product.hoverImage && (
                    <Image
                      src={
                        product.hoverImage
                      }
                      alt=""
                      fill
                      sizes="
                        (max-width: 640px) 100vw,
                        (max-width: 1024px) 50vw,
                        (max-width: 1280px) 33vw,
                        25vw
                      "
                      className="
                        object-cover
                        opacity-0
                        transition-all
                        duration-700
                        ease-out
                        group-hover:scale-[1.018]
                        group-hover:opacity-100
                      "
                    />
                  )}

                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-[#242320]/16
                      via-transparent
                      to-transparent
                    "
                  />

                  {/* REMOVE FAVORITE */}

                  <button
                    type="button"
                    onClick={() =>
                      removeFavorite(
                        product.id
                      )
                    }
                    aria-label={
                      dictionary.remove
                    }
                    title={
                      dictionary.remove
                    }
                    className="
                      absolute
                      end-4
                      top-4
                      z-30
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      border
                      border-accent
                      bg-accent
                      shadow-[0_10px_24px_rgba(146,115,74,0.14)]
                      text-white
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-danger
                      hover:bg-danger
                    "
                  >
                    <Heart
                      size={17}
                      strokeWidth={
                        1.4
                      }
                      fill="currentColor"
                    />
                  </button>

                  {/* VIEW PRODUCT */}

                  <span
                    className="
                      pointer-events-none
                      absolute
                      inset-x-4
                      bottom-4
                      z-20
                      translate-y-3
                      border
                      border-white/45
                      bg-[#E5E0D7]/88
                      px-4
                      py-3
                      text-center
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-foreground
                      opacity-0
                      backdrop-blur-xl
                      transition-all
                      duration-300
                      group-hover:translate-y-0
                      group-hover:opacity-100
                    "
                  >
                    {
                      dictionary.viewProduct
                    }
                  </span>
                </div>

                {/* =========================================
                    PRODUCT INFORMATION
                ========================================= */}

                <div
                  className="
                    border-b
                    border-white/20
                    pb-6
                    pt-5
                  "
                >
                  {/* PRODUCT NAME */}

                  <Link
                    href={`/${locale}/products/${product.slug}`}
                    className="
                      block
                      w-fit
                      max-w-full
                    "
                  >
                    <h2
                      className="
                        min-w-0
                        font-heading
                        text-[25px]
                        font-semibold
                        leading-[0.98]
                        tracking-[-0.025em]
                        text-foreground
                        transition-colors
                        duration-300
                        hover:text-accent
                        lg:text-[27px]
                      "
                    >
                      {
                        productName
                      }
                    </h2>
                  </Link>

                  {/* DESCRIPTION */}

                  <p
                    className="
                      mt-3.5
                      line-clamp-2
                      text-[11px]
                      sm:text-xs
                      leading-6
                      text-foreground-soft
                    "
                  >
                    {
                      product
                        .shortDescription[
                        locale
                      ]
                    }
                  </p>

                  {/* COLORS */}

                  <div
                    className="
                      mt-4.5
                      flex
                      min-h-5
                      items-center
                      gap-2.5
                    "
                  >
                    {product.colors.map(
                      (
                        color
                      ) => (
                        <span
                          key={
                            color
                          }
                          aria-hidden="true"
                          className="
                            h-3
                            w-3
                            rounded-full
                            border
                            border-black/15
                            shadow-[0_0_0_1px_rgba(255,255,255,0.22)]
                          "
                          style={{
                            backgroundColor:
                              color,
                          }}
                        />
                      )
                    )}
                  </div>

                  {/* =======================================
                      WHATSAPP PRICE CTA
                  ======================================= */}

                  <a
                    href={
                      whatsappUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      group/whatsapp
                      relative
                      mt-4
                      inline-flex
                      min-h-9
                      items-center
                      gap-2.5
                      overflow-hidden
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-accent
                      transition-colors
                      duration-300
                      hover:text-foreground
                      sm:text-[10px]
                    "
                  >
                    <span
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        border
                        border-accent/30
                        bg-[#E5E0D7]/10
                        backdrop-blur-[1px]
                        transition-all
                        duration-300
                        ease-out
                        group-hover/whatsapp:border-accent
                        group-hover/whatsapp:bg-accent
                        group-hover/whatsapp:text-white
                        group-hover/whatsapp:shadow-[0_8px_24px_rgba(146,115,74,0.18)]
                      "
                    >
                      <MessageCircle
                        size={14}
                        strokeWidth={
                          1.4
                        }
                        className="
                          transition-transform
                          duration-300
                          ease-out
                          group-hover/whatsapp:scale-105
                        "
                      />
                    </span>

                    <span
                      className="
                        relative
                        py-1
                      "
                    >
                      {
                        copy.priceInfo
                      }

                      <span
                        aria-hidden="true"
                        className="
                          absolute
                          -bottom-0.5
                          start-0
                          h-px
                          w-0
                          bg-accent
                          transition-all
                          duration-300
                          ease-out
                          group-hover/whatsapp:w-full
                        "
                      />
                    </span>

                    <ArrowUpRight
                      size={14}
                      strokeWidth={
                        1.35
                      }
                      className="
                        transition-all
                        duration-300
                        ease-out
                        group-hover/whatsapp:-translate-y-0.5
                        group-hover/whatsapp:translate-x-0.5
                        rtl:group-hover/whatsapp:-translate-x-0.5
                      "
                    />
                  </a>
                </div>
              </article>
            );
          }
        )}
      </MobileProductSlider>
    </div>
  );
}