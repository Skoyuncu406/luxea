import Link from "next/link";
import { notFound } from "next/navigation";
import BrandStory from "@/components/home/BrandStory";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Navbar from "@/components/layout/Navbar";

import {
  isValidLocale,
} from "@/lib/i18n/config";

import {
  getDictionary,
} from "@/lib/i18n/get-dictionary";

type HomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function HomePage({
  params,
}: HomePageProps) {
  const {
    locale,
  } = await params;

  if (
    !isValidLocale(
      locale
    )
  ) {
    notFound();
  }

  const dictionary =
    await getDictionary(
      locale
    );

  const isTurkish =
    locale === "tr";

  return (
    <main
      className="
        relative
        min-h-screen
        w-full
        overflow-x-clip
        bg-transparent
        text-foreground
      "
    >
      {/* =====================================================
          ORTAK ANA SAYFA KAPLAMASI
      =====================================================

          Bu katman:

          Hero
          CategoryShowcase
          FeaturedProducts

          bölümlerinin tamamını aynı tonda tutar.

          Sabit Hero.png layout.tsx içerisinden gelir.
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-0

          bg-[#E5E0D7]/18

          backdrop-blur-[0.5px]
        "
      />

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar
        locale={locale}
        dictionary={dictionary}
      />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          relative
          z-10

          flex
          min-h-[100dvh]
          w-full

          items-center
          justify-center

          overflow-hidden

          pt-[116px]

          sm:pt-[124px]

          lg:pt-[84px]
        "
      >
        {/*
         * ÖNEMLİ:
         *
         * Hero içerisinde artık:
         *
         * - ayrı Hero.png
         * - ayrı beige overlay
         * - radial background overlay
         * - navbar gradient
         * - alt gradient
         * - vignette
         *
         * bulunmuyor.
         *
         * Böylece Hero'nun tonu aşağıdaki bölümlerle
         * birebir aynı kalıyor.
         */}

        {/* =================================================
            HERO CONTENT
        ================================================= */}

        <div
          className="
            container-premium
            relative
            z-10

            flex
            w-full
            justify-center

            py-8

            sm:py-12

            lg:py-20
          "
        >
          <div
            className="
              flex
              w-full
              max-w-[1100px]
              flex-col

              items-center

              text-center
            "
          >
            {/* =============================================
                EYEBROW
            ============================================= */}

            <p
              className="
                mb-4
                w-full

                text-center
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.24em]

                text-accent

                sm:mb-5
                sm:text-[11px]
                sm:tracking-[0.3em]

                lg:mb-6
                lg:text-xs
                lg:tracking-[0.34em]
              "
            >
              {
                dictionary.hero
                  .eyebrow
              }
            </p>

            {/* =============================================
                HERO TITLE
            ============================================= */}

            {isTurkish ? (
              <>
                {/* MOBILE + TABLET */}

                <h1
                  className="
                    w-full

                    text-center

                    font-heading
                    font-semibold

                    text-[clamp(2.3rem,9.5vw,4.75rem)]

                    leading-[0.98]

                    tracking-[-0.035em]

                    text-foreground

                    lg:hidden
                  "
                >
                  {
                    dictionary.hero
                      .title
                  }
                </h1>

                {/* DESKTOP */}

                <h1
                  className="
                    hidden
                    w-full

                    text-center

                    font-heading
                    font-semibold

                    text-[78px]

                    leading-[0.94]

                    tracking-[-0.045em]

                    text-foreground

                    lg:block

                    xl:text-[90px]

                    2xl:text-[98px]
                  "
                >
                  <span className="block">
                    Detaylarda saklı olan
                  </span>

                  <span className="mt-2 block">
                    zamansız zarafet.
                  </span>
                </h1>
              </>
            ) : (
              <h1
                className="
                  w-full

                  text-center

                  font-heading
                  font-semibold

                  text-[clamp(2.3rem,9.5vw,4.75rem)]

                  leading-[0.98]

                  tracking-[-0.035em]

                  text-foreground

                  lg:text-[78px]
                  lg:leading-[0.94]

                  xl:text-[90px]

                  2xl:text-[98px]
                "
              >
                {
                  dictionary.hero
                    .title
                }
              </h1>
            )}

            {/* =============================================
                DESCRIPTION
            ============================================= */}

            <p
              className="
                mt-5

                w-full
                max-w-[650px]

                text-center

                text-[13px]
                leading-6

                text-foreground-soft

                sm:mt-7
                sm:text-base
                sm:leading-8

                md:mt-8
                md:text-[17px]
              "
            >
              {
                dictionary.hero
                  .description
              }
            </p>

            {/* =============================================
                ACTIONS
            ============================================= */}

            <div
              className="
                mt-8

                flex
                w-full
                flex-col

                items-center
                justify-center

                gap-4

                sm:mt-10
                sm:flex-row
                sm:flex-wrap
                sm:gap-5

                lg:mt-11
                lg:gap-7
              "
            >
              {/* =========================================
                  PRIMARY CTA
              ========================================= */}

              <Link
                href={`/${locale}/products`}
                className="
                  group
                  relative

                  inline-flex

                  min-h-12
                  w-full
                  max-w-[320px]

                  shrink-0

                  items-center
                  justify-center

                  overflow-hidden

                  border
                  border-[#242320]

                  bg-[#242320]

                  px-6

                  text-center

                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]

                  !text-[#F3F0EA]

                  shadow-[0_14px_35px_rgba(36,35,32,0.14)]

                  transition-all
                  duration-500
                  ease-out

                  hover:-translate-y-1

                  hover:border-[#92734A]

                  hover:bg-[#92734A]

                  hover:!text-white

                  hover:shadow-[0_18px_45px_rgba(146,115,74,0.23)]

                  sm:min-h-14

                  sm:w-auto
                  sm:max-w-none

                  sm:px-9

                  sm:text-xs
                  sm:tracking-[0.18em]
                "
              >
                {/* PREMIUM SHINE */}

                <span
                  aria-hidden="true"
                  className="
                    pointer-events-none

                    absolute
                    inset-y-0
                    -start-24

                    w-16

                    skew-x-[-20deg]

                    bg-white/10

                    transition-all
                    duration-700

                    group-hover:start-[120%]
                  "
                />

                <span
                  className="
                    relative
                    z-10

                    whitespace-nowrap

                    !text-[#F3F0EA]
                  "
                >
                  {
                    dictionary.hero
                      .primaryAction
                  }
                </span>
              </Link>

              {/* =========================================
                  SECONDARY CTA
              ========================================= */}

              <Link
                href={`/${locale}/about`}
                className="
                  group

                  inline-flex

                  min-h-12

                  shrink-0

                  items-center
                  justify-center

                  gap-3

                  text-center

                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]

                  text-foreground

                  transition-colors
                  duration-300

                  hover:text-accent

                  sm:min-h-14
                  sm:gap-4
                  sm:text-xs
                  sm:tracking-[0.18em]
                "
              >
                <span className="whitespace-nowrap">
                  {
                    dictionary.hero
                      .secondaryAction
                  }
                </span>

                <span
                  className="
                    hidden
                    w-20
                    items-center

                    sm:flex
                  "
                >
                  <span
                    className="
                      h-px
                      w-12

                      bg-accent

                      transition-[width]
                      duration-500
                      ease-out

                      group-hover:w-20
                    "
                  />
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* =================================================
            ALT DEKORATİF ÇİZGİ
        ================================================= */}

        <div
          className="
            absolute
            inset-inline-0
            bottom-4
            z-10

            sm:bottom-6

            lg:bottom-8
          "
        >
          <div className="container-premium">
            <div
              className="
                premium-line
                opacity-40
              "
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORY SHOWCASE
      ===================================================== */}

      <div className="relative z-10">
        <CategoryShowcase
          locale={locale}
          dictionary={
            dictionary.categoryShowcase
          }
        />
      </div>

      {/* =====================================================
          FEATURED PRODUCTS
      ===================================================== */}

      <div className="relative z-10">
        <FeaturedProducts
          locale={locale}
          dictionary={
            dictionary.featuredProducts
          }
        />
      </div>
       <div className="relative z-10">
        <BrandStory
          locale={locale}
        />
      </div>
    </main>
  );
}