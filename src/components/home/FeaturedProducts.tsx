"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  MessageCircle,
  PackageSearch,
} from "lucide-react";

import MobileProductSlider from "@/components/products/MobileProductSlider";

import {
  useProducts,
} from "@/contexts/ProductContext";

import type {
  Locale,
} from "@/lib/i18n/config";

import type {
  Product,
} from "@/types/product";

/* =========================================================
   TYPES
========================================================= */

type FeaturedProductsDictionary = {
  eyebrow: string;
  title: string;
  description: string;
  viewAll: string;
  newLabel: string;
  explore: string;
};

type FeaturedProductsProps = {
  locale: Locale;
  dictionary: FeaturedProductsDictionary;
};

type ProductCardProps = {
  product: Product;
  locale: Locale;
  dictionary: FeaturedProductsDictionary;
  priceInfo: string;
  whatsappUrl: string;
};

/* =========================================================
   WHATSAPP
========================================================= */

const WHATSAPP_NUMBER =
  "905453577806";

const whatsappCopy = {
  tr: {
    priceInfo:
      "Fiyat Bilgisi Al",

    message:
      "Merhaba LUXEA, {product} ürünü hakkında fiyat ve sipariş bilgisi almak istiyorum.",

    previous:
      "Önceki ürünler",

    next:
      "Sonraki ürünler",
  },

  en: {
    priceInfo:
      "Request Price",

    message:
      "Hello LUXEA, I would like to get price and order information about {product}.",

    previous:
      "Previous products",

    next:
      "Next products",
  },

  ar: {
    priceInfo:
      "طلب السعر",

    message:
      "مرحباً LUXEA، أود الحصول على معلومات السعر والطلب لمنتج {product}.",

    previous:
      "المنتجات السابقة",

    next:
      "المنتجات التالية",
  },
} as const;

/* =========================================================
   DESKTOP PER VIEW
========================================================= */

function getDesktopPerView() {
  if (
    typeof window ===
    "undefined"
  ) {
    return 3;
  }

  if (
    window.innerWidth <
    1024
  ) {
    return 2;
  }

  return 3;
}

/* =========================================================
   FEATURED PRODUCTS
========================================================= */

export default function FeaturedProducts({
  locale,
  dictionary,
}: FeaturedProductsProps) {
  const {
    products,
    isLoaded,
  } = useProducts();

  const copy =
    whatsappCopy[locale];

  /*
   * Masaüstü/tablet carousel.
   *
   * Mobil slider artık MobileProductSlider
   * tarafından yönetiliyor.
   */
  const [
    perView,
    setPerView,
  ] = useState(3);

  const [
    activeSlide,
    setActiveSlide,
  ] = useState(0);

  const [
    isPaused,
    setIsPaused,
  ] = useState(false);

  /* =======================================================
     FEATURED PRODUCTS
  ======================================================= */

  const featuredProducts =
    useMemo(() => {
      return [...products]
        .filter(
          (product) =>
            product.isActive &&
            product.isFeatured
        )
        .sort(
          (a, b) =>
            a.order -
            b.order
        );
    }, [
      products,
    ]);

  /* =======================================================
     TABLET / DESKTOP PER VIEW
  ======================================================= */

  useEffect(() => {
    function syncPerView() {
      setPerView(
        getDesktopPerView()
      );
    }

    syncPerView();

    window.addEventListener(
      "resize",
      syncPerView
    );

    return () => {
      window.removeEventListener(
        "resize",
        syncPerView
      );
    };
  }, []);

  /* =======================================================
     TABLET / DESKTOP SLIDES
  ======================================================= */

  const slides =
    useMemo(() => {
      const nextSlides: Product[][] =
        [];

      for (
        let index = 0;
        index <
        featuredProducts.length;
        index += perView
      ) {
        nextSlides.push(
          featuredProducts.slice(
            index,
            index + perView
          )
        );
      }

      return nextSlides;
    }, [
      featuredProducts,
      perView,
    ]);

  /*
   * Ürün sayısı veya perView değişirse
   * state'i effect içinde sıfırlamıyoruz.
   *
   * Böylece React'ın setState-in-effect
   * lint problemi oluşmuyor.
   */
  const safeActiveSlide =
    Math.min(
      activeSlide,
      Math.max(
        slides.length - 1,
        0
      )
    );

  /* =======================================================
     TABLET / DESKTOP AUTO PLAY
  ======================================================= */

  useEffect(() => {
    if (
      isPaused ||
      slides.length <= 1
    ) {
      return;
    }

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    if (
      reducedMotion.matches
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setActiveSlide(
            (current) => {
              const safeCurrent =
                Math.min(
                  current,
                  Math.max(
                    slides.length -
                      1,
                    0
                  )
                );

              return (
                safeCurrent + 1
              ) %
                slides.length;
            }
          );
        },
        4200
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    isPaused,
    slides.length,
  ]);

  /* =======================================================
     PREVIOUS
  ======================================================= */

  function goPrevious() {
    if (
      slides.length <= 1
    ) {
      return;
    }

    setActiveSlide(
      (current) => {
        const safeCurrent =
          Math.min(
            current,
            slides.length - 1
          );

        return safeCurrent === 0
          ? slides.length - 1
          : safeCurrent - 1;
      }
    );
  }

  /* =======================================================
     NEXT
  ======================================================= */

  function goNext() {
    if (
      slides.length <= 1
    ) {
      return;
    }

    setActiveSlide(
      (current) => {
        const safeCurrent =
          Math.min(
            current,
            slides.length - 1
          );

        return (
          safeCurrent + 1
        ) %
          slides.length;
      }
    );
  }

  /* =======================================================
     WHATSAPP
  ======================================================= */

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

  /* =======================================================
     LOADING
  ======================================================= */

  if (!isLoaded) {
    return (
      <section className="relative overflow-hidden bg-transparent">
        <div className="container-premium relative z-10">
          <div className="flex min-h-[300px] items-center justify-center border-b border-white/20">
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              {locale === "tr"
                ? "Ürünler yükleniyor"
                : locale === "ar"
                  ? "جارٍ تحميل المنتجات"
                  : "Loading products"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="container-premium relative z-10 py-7 sm:py-8 lg:py-10">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-6 border-b border-white/20 pb-7 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-[820px]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-accent sm:text-[10px]">
              {
                dictionary.eyebrow
              }
            </p>

            <h2 className="mt-2.5 font-heading text-[32px] font-semibold leading-[0.96] tracking-[-0.025em] text-foreground sm:text-[36px] lg:text-[42px] xl:text-[46px]">
              {
                dictionary.title
              }
            </h2>

            <p className="mt-3 max-w-2xl text-[11px] leading-5 text-foreground-soft sm:text-xs sm:leading-6">
              {
                dictionary.description
              }
            </p>
          </div>

          {/* ===============================================
              HEADER ACTIONS
          =============================================== */}

          <div className="flex items-center gap-3">
            {slides.length >
              1 && (
              <div className="hidden items-center gap-2 sm:flex">
                {/* PREVIOUS */}

                <button
                  type="button"
                  onClick={
                    goPrevious
                  }
                  aria-label={
                    copy.previous
                  }
                  className="group flex h-10 w-10 items-center justify-center border border-white/25 bg-[#E5E0D7]/10 text-foreground backdrop-blur-[1px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-white hover:shadow-[0_10px_28px_rgba(146,115,74,0.16)]"
                >
                  <ArrowLeft
                    size={14}
                    strokeWidth={
                      1.4
                    }
                    className="transition-transform duration-300 group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5"
                  />
                </button>

                {/* NEXT */}

                <button
                  type="button"
                  onClick={
                    goNext
                  }
                  aria-label={
                    copy.next
                  }
                  className="group flex h-10 w-10 items-center justify-center border border-white/25 bg-[#E5E0D7]/10 text-foreground backdrop-blur-[1px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-white hover:shadow-[0_10px_28px_rgba(146,115,74,0.16)]"
                >
                  <ArrowRight
                    size={14}
                    strokeWidth={
                      1.4
                    }
                    className="transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                  />
                </button>
              </div>
            )}

            {/* ALL PRODUCTS */}

            <Link
              href={`/${locale}/products`}
              className="group inline-flex w-fit items-center gap-3.5 text-[9px] font-semibold uppercase tracking-[0.19em] text-foreground transition-colors duration-300 hover:text-accent sm:text-[10px]"
            >
              <span>
                {
                  dictionary.viewAll
                }
              </span>

              <span className="flex h-9 w-9 items-center justify-center border border-white/25 bg-[#E5E0D7]/10 backdrop-blur-[1px] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-accent group-hover:bg-accent group-hover:text-white group-hover:shadow-[0_10px_26px_rgba(146,115,74,0.15)]">
                <ArrowUpRight
                  size={14}
                  strokeWidth={
                    1.4
                  }
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                />
              </span>
            </Link>
          </div>
        </div>

        {/* =================================================
            EMPTY
        ================================================= */}

        {featuredProducts.length ===
        0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center border-b border-white/20 px-5 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center border border-accent/30 bg-accent/10 text-accent">
              <PackageSearch
                size={23}
                strokeWidth={
                  1.2
                }
              />
            </span>

            <h3 className="mt-5 font-heading text-3xl leading-none text-foreground">
              {locale === "tr"
                ? "Henüz öne çıkan ürün bulunmuyor."
                : locale === "ar"
                  ? "لا توجد منتجات مميزة حتى الآن."
                  : "No featured products yet."}
            </h3>
          </div>
        ) : (
          <>
            {/* =================================================
                MOBILE

                Tek ürün
                Auto slide
                Swipe
                Touch
                Snap
                Dot indicator

                Diğer ürün sayfalarında kullandığımız ortak
                MobileProductSlider sistemi.
            ================================================= */}

            <div className="mt-7 sm:hidden">
              <MobileProductSlider
                interval={4200}
              >
                {featuredProducts.map(
                  (product) => {
                    const productName =
                      product.name[
                        locale
                      ];

                    return (
                      <ProductCard
                        key={
                          product.id
                        }
                        product={
                          product
                        }
                        locale={
                          locale
                        }
                        dictionary={
                          dictionary
                        }
                        priceInfo={
                          copy.priceInfo
                        }
                        whatsappUrl={getWhatsAppUrl(
                          productName
                        )}
                      />
                    );
                  }
                )}
              </MobileProductSlider>
            </div>

            {/* =================================================
                TABLET + DESKTOP CAROUSEL
            ================================================= */}

            <div
              className="relative mt-7 hidden overflow-hidden sm:block"
              onMouseEnter={() =>
                setIsPaused(
                  true
                )
              }
              onMouseLeave={() =>
                setIsPaused(
                  false
                )
              }
            >
              <div
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transform: `translateX(-${safeActiveSlide * 100}%)`,
                }}
              >
                {slides.map(
                  (
                    slide,
                    slideIndex
                  ) => (
                    <div
                      key={
                        slideIndex
                      }
                      className="w-full shrink-0"
                    >
                      <div
                        className={[
                          "grid gap-6 lg:gap-7",

                          perView ===
                          2
                            ? "grid-cols-2"
                            : "grid-cols-3",
                        ].join(
                          " "
                        )}
                      >
                        {slide.map(
                          (
                            product
                          ) => {
                            const productName =
                              product
                                .name[
                                locale
                              ];

                            return (
                              <ProductCard
                                key={
                                  product.id
                                }
                                product={
                                  product
                                }
                                locale={
                                  locale
                                }
                                dictionary={
                                  dictionary
                                }
                                priceInfo={
                                  copy.priceInfo
                                }
                                whatsappUrl={getWhatsAppUrl(
                                  productName
                                )}
                              />
                            );
                          }
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* DESKTOP INDICATORS */}

              {slides.length >
                1 && (
                <div className="mt-6 flex items-center justify-center gap-2.5 pb-2">
                  {slides.map(
                    (
                      _,
                      index
                    ) => {
                      const isActive =
                        index ===
                        safeActiveSlide;

                      return (
                        <button
                          key={
                            index
                          }
                          type="button"
                          onClick={() =>
                            setActiveSlide(
                              index
                            )
                          }
                          aria-label={`${index + 1}`}
                          aria-current={
                            isActive
                              ? "true"
                              : undefined
                          }
                          className={[
                            "h-px transition-all duration-300",

                            isActive
                              ? "w-8 bg-accent"
                              : "w-4 bg-border-strong/70 hover:bg-accent/60",
                          ].join(
                            " "
                          )}
                        />
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  locale,
  dictionary,
  priceInfo,
  whatsappUrl,
}: ProductCardProps) {
  const productName =
    product.name[locale];

  return (
    <article className="group min-w-0">
      {/* =====================================================
          IMAGE
      ===================================================== */}

      <Link
        href={`/${locale}/products/${product.slug}`}
        className="block"
        aria-label={
          productName
        }
      >
        <div className="relative aspect-[4/3] overflow-hidden border border-white/20 bg-surface/45 sm:aspect-[4/3] lg:aspect-[16/10]">
          {/* PRIMARY IMAGE */}

          <Image
            src={
              product.image
            }
            alt={
              productName
            }
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={[
              "object-cover object-center",

              "transition-all",

              "duration-700",

              "ease-out",

              product.hoverImage
                ? "group-hover:scale-[1.02] group-hover:opacity-0"
                : "group-hover:scale-[1.025]",
            ].join(" ")}
          />

          {/* HOVER IMAGE */}

          {product.hoverImage && (
            <Image
              src={
                product.hoverImage
              }
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.02] group-hover:opacity-100"
            />
          )}

          {/* PREMIUM GRADIENT */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#242320]/22 via-transparent to-transparent"
          />

          {/* NEW */}

          {product.isNew && (
            <span className="absolute start-3.5 top-3.5 z-10 border border-white/45 bg-[#242320]/20 px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
              {
                dictionary.newLabel
              }
            </span>
          )}

          {/* EXPLORE */}

          <span className="pointer-events-none absolute inset-x-3.5 bottom-3.5 translate-y-2 border border-white/40 bg-[#E5E0D7]/88 px-3.5 py-2.5 text-center text-[8px] font-semibold uppercase tracking-[0.17em] text-foreground opacity-0 backdrop-blur-xl transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            {
              dictionary.explore
            }
          </span>
        </div>
      </Link>

      {/* =====================================================
          PRODUCT INFO
      ===================================================== */}

      <div className="border-b border-white/20 pb-6 pt-4">
        {/* NAME */}

        <Link
          href={`/${locale}/products/${product.slug}`}
          className="block w-fit max-w-full"
        >
          <h3 className="font-heading text-[21px] font-semibold leading-[0.98] tracking-[-0.02em] text-foreground transition-colors duration-300 hover:text-accent sm:text-[23px] lg:text-[24px]">
            {
              productName
            }
          </h3>
        </Link>

        {/* DESCRIPTION */}

        <p className="mt-2 line-clamp-1 text-[10px] leading-5 text-foreground-soft sm:text-[11px]">
          {
            product
              .shortDescription[
              locale
            ]
          }
        </p>

        {/* COLORS */}

        <div className="mt-2.5 flex min-h-4 items-center gap-2">
          {product.colors
            .slice(
              0,
              5
            )
            .map(
              (
                color
              ) => (
                <span
                  key={
                    color
                  }
                  aria-label={
                    color
                  }
                  className="h-3 w-3 rounded-full border border-black/15 shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
                  style={{
                    backgroundColor:
                      color,
                  }}
                />
              )
            )}
        </div>

        {/* =================================================
            WHATSAPP PRICE
        ================================================= */}

        <a
          href={
            whatsappUrl
          }
          target="_blank"
          rel="noopener noreferrer"
          className="group/whatsapp mt-3 inline-flex min-h-8 items-center gap-2.5 text-[8px] font-semibold uppercase tracking-[0.17em] text-accent transition-colors duration-300 hover:text-foreground sm:text-[9px]"
        >
          <span className="flex h-7 w-7 items-center justify-center border border-accent/30 bg-[#E5E0D7]/10 backdrop-blur-[1px] transition-all duration-300 group-hover/whatsapp:border-accent group-hover/whatsapp:bg-accent group-hover/whatsapp:text-white group-hover/whatsapp:shadow-[0_8px_22px_rgba(146,115,74,0.15)]">
            <MessageCircle
              size={12}
              strokeWidth={
                1.4
              }
              className="transition-transform duration-300 group-hover/whatsapp:scale-105"
            />
          </span>

          <span>
            {
              priceInfo
            }
          </span>

          <ArrowUpRight
            size={12}
            strokeWidth={
              1.35
            }
            className="transition-transform duration-300 group-hover/whatsapp:-translate-y-0.5 group-hover/whatsapp:translate-x-0.5 rtl:group-hover/whatsapp:-translate-x-0.5"
          />
        </a>
      </div>
    </article>
  );
}