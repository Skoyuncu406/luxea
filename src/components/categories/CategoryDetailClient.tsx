"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowUpRight,
  MessageCircle,
  PackageSearch,
} from "lucide-react";

import MobileProductSlider from "@/components/products/MobileProductSlider";

import {
  useCategories,
} from "@/contexts/CategoryContext";

import {
  useProducts,
} from "@/contexts/ProductContext";

import type {
  Locale,
} from "@/lib/i18n/config";

type CategoryDetailDictionary = {
  viewAll: string;
  explore: string;
};

type ProductsDictionary = {
  newLabel: string;
  viewProduct: string;
};

type CategoryDetailClientProps = {
  locale: Locale;
  slug: string;

  categoryDictionary:
    CategoryDetailDictionary;

  productsDictionary:
    ProductsDictionary;
};

const WHATSAPP_NUMBER =
  "905453577806";

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

export default function CategoryDetailClient({
  locale,
  slug,
  categoryDictionary,
  productsDictionary,
}: CategoryDetailClientProps) {
  const {
    categories,
    isLoaded:
      categoriesLoaded,
  } = useCategories();

  const {
    products,
    isLoaded:
      productsLoaded,
  } = useProducts();

  const isLoaded =
    categoriesLoaded &&
    productsLoaded;

  const copy =
    whatsappCopy[locale];

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

  if (!isLoaded) {
    return (
      <div className="flex min-h-[520px] items-center justify-center border-y border-white/20 px-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
          {locale === "tr"
            ? "Kategori yükleniyor"
            : locale === "ar"
              ? "جارٍ تحميل الفئة"
              : "Loading category"}
        </p>
      </div>
    );
  }

  const category =
    categories.find(
      (item) =>
        item.slug ===
          slug &&
        item.isActive
    );

  if (!category) {
    return (
      <CategoryNotFoundState
        locale={locale}
      />
    );
  }

  const categoryProducts =
    [...products]
      .filter(
        (product) =>
          product.categoryId ===
            category.id &&
          product.isActive
      )
      .sort(
        (a, b) =>
          a.order -
          b.order
      );

  return (
    <div className="w-full">
      {/* =====================================================
          CATEGORY HEADER
      ===================================================== */}

      <div className="mx-auto flex w-full max-w-[900px] flex-col items-center text-center">
        <p className="w-full text-center text-[9px] font-semibold uppercase tracking-[0.34em] text-accent sm:text-[10px]">
          {
            category
              .eyebrow[
              locale
            ]
          }
        </p>

        <h1 className="mt-4 w-full text-center font-heading text-5xl font-semibold leading-[0.94] tracking-[-0.04em] sm:text-6xl lg:text-[76px] xl:text-[84px]">
          {
            category
              .name[
              locale
            ]
          }
        </h1>

        <p className="mx-auto mt-6 max-w-[680px] text-center text-sm leading-7 text-foreground-soft sm:text-[15px] sm:leading-8">
          {locale === "tr"
            ? `${category.name[locale]} kategorisindeki seçkin LUXEA ürünlerini keşfedin.`
            : locale === "ar"
              ? `اكتشف منتجات LUXEA المختارة ضمن فئة ${category.name[locale]}.`
              : `Discover selected LUXEA pieces from the ${category.name[locale]} category.`}
        </p>

        <Link
          href={`/${locale}/categories`}
          className="group mt-8 inline-flex items-center gap-3.5 text-[9px] font-semibold uppercase tracking-[0.19em] text-foreground transition-colors duration-300 hover:text-accent"
        >
          <ArrowLeft
            size={14}
            strokeWidth={1.4}
            className="transition-transform duration-300 group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1"
          />

          <span>
            {locale === "tr"
              ? "Tüm Kategoriler"
              : locale === "ar"
                ? "جميع الفئات"
                : "All Categories"}
          </span>
        </Link>
      </div>

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      {categoryProducts.length >
      0 ? (
        <MobileProductSlider
          className="mt-14"
          desktopClassName="sm:grid-cols-2 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-7"
        >
          {categoryProducts.map(
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
                  className="group min-w-0"
                >
                  {/* =================================================
                      PRODUCT IMAGE
                  ================================================= */}

                  <Link
                    href={`/${locale}/products/${product.slug}`}
                    className="block"
                    aria-label={
                      productName
                    }
                  >
                    <div className="relative aspect-[4/5] overflow-hidden border border-white/20 bg-surface/45 shadow-[0_18px_45px_rgba(36,35,32,0.055)]">
                      <Image
                        src={
                          product.image
                        }
                        alt={
                          productName
                        }
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className={[
                          "object-cover object-center",
                          "transition-all duration-700 ease-out",
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
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="
                            object-cover
                            object-center

                            opacity-0

                            transition-all
                            duration-700
                            ease-out

                            group-hover:scale-[1.018]
                            group-hover:opacity-100
                          "
                        />
                      )}

                      {/* Premium alt gradient */}

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

                      {/* Yeni ürün etiketi */}

                      {product.isNew && (
                        <span className="absolute start-4 top-4 z-10 border border-white/45 bg-[#242320]/20 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.21em] text-white backdrop-blur-md">
                          {
                            productsDictionary
                              .newLabel
                          }
                        </span>
                      )}

                      {/* Ürünü görüntüle hover */}

                      <span
                        className="
                          pointer-events-none
                          absolute
                          inset-x-4
                          bottom-4

                          translate-y-3

                          border
                          border-white/45

                          bg-[#E5E0D7]/88

                          px-4
                          py-3

                          text-center
                          text-[8px]
                          font-semibold
                          uppercase
                          tracking-[0.18em]
                          text-foreground

                          opacity-0

                          backdrop-blur-xl

                          transition-all
                          duration-500

                          group-hover:translate-y-0
                          group-hover:opacity-100
                        "
                      >
                        {
                          productsDictionary
                            .viewProduct
                        }
                      </span>
                    </div>
                  </Link>

                  {/* =================================================
                      PRODUCT INFO
                  ================================================= */}

                  <div className="border-b border-white/20 pb-6 pt-5 text-center">
                    <Link
                      href={`/${locale}/products/${product.slug}`}
                      className="block"
                    >
                      <h2
                        className="
                          font-heading
                          text-[25px]
                          font-semibold
                          leading-[0.98]
                          tracking-[-0.025em]
                          text-foreground

                          transition-colors
                          duration-300

                          group-hover:text-accent
                        "
                      >
                        {
                          productName
                        }
                      </h2>
                    </Link>

                    {/* Short description */}

                    <p
                      className="
                        mx-auto
                        mt-3.5
                        line-clamp-2
                        max-w-[290px]

                        text-[11px]
                        leading-6
                        sm:text-xs
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

                    {/* Colors */}

                    {product.colors.length >
                      0 && (
                      <div className="mt-4.5 flex min-h-4 items-center justify-center gap-2.5">
                        {product.colors
                          .slice(
                            0,
                            6
                          )
                          .map(
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
                    )}

                    {/* =================================================
                        WHATSAPP PRICE CTA
                    ================================================= */}

                    <a
                      href={
                        whatsappUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        group/price

                        relative

                        mx-auto
                        mt-5

                        inline-flex
                        min-h-11

                        items-center
                        justify-center
                        gap-3

                        overflow-hidden

                        border
                        border-accent/30

                        bg-[#E5E0D7]/10

                        px-5

                        text-[8px]
                        font-semibold
                        uppercase
                        tracking-[0.18em]

                        text-accent

                        transition-all
                        duration-300

                        hover:-translate-y-0.5
                        hover:border-accent
                        hover:bg-accent
                        hover:!text-white
                        hover:shadow-[0_14px_30px_rgba(146,115,74,0.14)]

                        sm:text-[9px]
                      "
                    >
                      <MessageCircle
                        size={14}
                        strokeWidth={1.45}
                        className="
                          relative
                          z-10

                          transition-transform
                          duration-300

                          group-hover/price:scale-105
                        "
                      />

                      <span className="relative z-10">
                        {
                          copy.priceInfo
                        }
                      </span>

                      <ArrowUpRight
                        size={13}
                        strokeWidth={1.4}
                        className="
                          relative
                          z-10

                          transition-transform
                          duration-300

                          group-hover/price:-translate-y-0.5
                          group-hover/price:translate-x-0.5

                          rtl:group-hover/price:-translate-x-0.5
                        "
                      />
                    </a>
                  </div>
                </article>
              );
            }
          )}
        </MobileProductSlider>
      ) : (
        <div className="mt-14 flex min-h-[360px] flex-col items-center justify-center border-y border-white/20 px-5 py-12 text-center">
          <PackageSearch
            size={34}
            strokeWidth={1.1}
            className="text-accent"
          />

          <h2 className="mt-7 font-heading text-4xl font-semibold leading-[0.96] tracking-[-0.03em] text-foreground sm:text-5xl">
            {locale === "tr"
              ? "Bu kategoride henüz ürün yok."
              : locale === "ar"
                ? "لا توجد منتجات في هذه الفئة حتى الآن."
                : "There are no products in this category yet."}
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-foreground-soft">
            {locale === "tr"
              ? "Yeni ürünler eklendiğinde burada otomatik olarak görünecek."
              : locale === "ar"
                ? "ستظهر المنتجات الجديدة هنا تلقائياً عند إضافتها."
                : "New products will appear here automatically when they are added."}
          </p>

          <Link
            href={`/${locale}/products`}
            className="
              mt-8
              inline-flex
              min-h-12
              items-center
              justify-center

              border
              border-foreground

              px-7

              text-[9px]
              font-semibold
              uppercase
              tracking-[0.15em]
              text-foreground

              transition-all
              duration-300

              hover:bg-foreground
              hover:!text-white
            "
          >
            {
              categoryDictionary
                .viewAll
            }
          </Link>
        </div>
      )}
    </div>
  );
}

/*
 * =============================================================
 * CATEGORY NOT FOUND
 * =============================================================
 */

function CategoryNotFoundState({
  locale,
}: {
  locale: Locale;
}) {
  return (
    <div className="flex min-h-[520px] items-center justify-center border-y border-white/20 px-5 py-14 text-center">
      <div className="mx-auto flex max-w-[620px] flex-col items-center">
        <PackageSearch
          size={34}
          strokeWidth={1.1}
          className="text-accent"
        />

        <h1 className="mt-7 font-heading text-5xl font-semibold leading-[0.96] tracking-[-0.035em] text-foreground sm:text-6xl">
          {locale === "tr"
            ? "Kategori bulunamadı."
            : locale === "ar"
              ? "لم يتم العثور على الفئة."
              : "Category not found."}
        </h1>

        <p className="mt-6 max-w-[520px] text-sm leading-7 text-foreground-soft">
          {locale === "tr"
            ? "Bu kategori silinmiş, pasif duruma getirilmiş veya bağlantısı değiştirilmiş olabilir."
            : locale === "ar"
              ? "قد تكون هذه الفئة قد حُذفت أو تم تعطيلها أو تغيير رابطها."
              : "This category may have been removed, deactivated, or its URL may have changed."}
        </p>

        <Link
          href={`/${locale}/categories`}
          className="
            mt-8
            inline-flex
            min-h-12
            items-center
            justify-center

            border
            border-foreground

            px-7

            text-[9px]
            font-semibold
            uppercase
            tracking-[0.15em]
            text-foreground

            transition-all
            duration-300

            hover:bg-foreground
            hover:!text-white
          "
        >
          {locale === "tr"
            ? "Kategorilere Dön"
            : locale === "ar"
              ? "العودة إلى الفئات"
              : "Back to Categories"}
        </Link>
      </div>
    </div>
  );
}