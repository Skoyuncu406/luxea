import Link from "next/link";

import {
  ArrowUpRight,
  Hand,
  Scissors,
} from "lucide-react";

import type {
  Locale,
} from "@/lib/i18n/config";

/*
 * =============================================================
 * TYPES
 * =============================================================
 */

type BrandStoryProps = {
  locale: Locale;
};

/*
 * =============================================================
 * CONTENT
 * =============================================================
 */

const content = {
  tr: {
    eyebrow:
      "Marka Hikayesi",

    titleFirst:
      "Detaylarda başlayan",

    titleSecond:
      "bir ustalık.",

    firstParagraph:
      "LUXEA, zamansız tasarımı geleneksel el işçiliğiyle buluşturur. Koleksiyonlarımızda kullandığımız %100 dana derisi, deneyimli ustaların ellerinde özenle işlenerek karakterini zamanla kazanan seçkin parçalara dönüşür.",

    secondParagraph:
      "Cüzdandan kemere, çantadan günlük yaşam aksesuarlarına kadar her türlü deri aksesuarı el işçiliğiyle üretiyor; malzeme seçiminden dikiş detaylarına kadar her aşamada kaliteyi ön planda tutuyoruz.",

    leather:
      "%100 Dana Derisi",

    handmade:
      "El Yapımı",

    action:
      "Marka Hikayemizi Keşfedin",
  },

  en: {
    eyebrow:
      "Our Story",

    titleFirst:
      "Craftsmanship begins",

    titleSecond:
      "in the details.",

    firstParagraph:
      "LUXEA brings timeless design together with traditional craftsmanship. The 100% calf leather used throughout our collections is carefully shaped by experienced artisans into distinctive pieces that develop their own character over time.",

    secondParagraph:
      "From wallets and belts to bags and everyday accessories, we craft a wide range of leather goods by hand, placing quality at the heart of every stage — from material selection to the finest stitching details.",

    leather:
      "100% Calf Leather",

    handmade:
      "Handcrafted",

    action:
      "Discover Our Story",
  },

  ar: {
    eyebrow:
      "قصتنا",

    titleFirst:
      "حرفية تبدأ",

    titleSecond:
      "من أدق التفاصيل.",

    firstParagraph:
      "تجمع LUXEA بين التصميم الخالد والحرفية التقليدية. ويُصنع الجلد البقري الطبيعي بنسبة 100% المستخدم في مجموعاتنا بعناية على أيدي حرفيين ذوي خبرة، ليتحول إلى قطع مميزة تكتسب شخصيتها مع مرور الوقت.",

    secondParagraph:
      "من المحافظ والأحزمة إلى الحقائب وإكسسوارات الحياة اليومية، نصنع مجموعة واسعة من المنتجات الجلدية يدوياً، مع الاهتمام بالجودة في كل مرحلة، بدءاً من اختيار الخامات وحتى أدق تفاصيل الخياطة.",

    leather:
      "جلد بقري طبيعي 100%",

    handmade:
      "صناعة يدوية",

    action:
      "اكتشف قصتنا",
  },
} as const;

/*
 * =============================================================
 * COMPONENT
 * =============================================================
 */

export default function BrandStory({
  locale,
}: BrandStoryProps) {
  const copy =
    content[locale];

  return (
    <section
      className="
        relative
        overflow-hidden
        border-t
        border-border/70
        py-20
        sm:py-24
        lg:py-32
        xl:py-36
      "
    >
      {/* =====================================================
          DECORATIVE BACKGROUND
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          end-[-10%]
          top-1/2
          h-[420px]
          w-[420px]
          -translate-y-1/2
          rounded-full
          bg-accent/[0.055]
          blur-[110px]

          lg:h-[620px]
          lg:w-[620px]
        "
      />

      <div className="container-premium relative z-10">
        <div
          className="
            grid
            items-center
            gap-14

            lg:grid-cols-[0.85fr_1.15fr]
            lg:gap-20

            xl:gap-28
          "
        >
          {/* =================================================
              LEFT — EDITORIAL SIGNATURE
          ================================================= */}

          <div
            className="
              relative
              mx-auto
              flex
              w-full
              max-w-[480px]
              items-center
              justify-center

              lg:mx-0
              lg:max-w-none
            "
          >
            <div
              className="
                relative
                flex
                aspect-[4/5]
                w-full
                max-w-[430px]
                items-center
                justify-center
                overflow-hidden

                border
                border-border

                bg-surface/40
              "
            >
              {/* LARGE L */}

              <span
                aria-hidden="true"
                className="
                  select-none
                  font-heading
                  text-[190px]
                  font-medium
                  leading-none
                  tracking-[-0.08em]
                  text-accent/[0.13]

                  sm:text-[240px]
                  lg:text-[270px]
                "
              >
                L
              </span>

              {/* CENTER COPY */}

              <div
                className="
                  absolute
                  inset-0
                  flex
                  flex-col
                  items-center
                  justify-center
                  px-8
                  text-center
                "
              >
                <span
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.32em]
                    text-accent

                    sm:text-[10px]
                  "
                >
                  LUXEA
                </span>

                <div
                  className="
                    my-6
                    h-12
                    w-px
                    bg-accent/50
                  "
                />

                <p
                  className="
                    max-w-[260px]
                    font-heading
                    text-3xl
                    leading-[1.05]
                    text-foreground

                    sm:text-4xl
                  "
                >
                  {copy.leather}
                </p>

                <p
                  className="
                    mt-4
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.24em]
                    text-muted
                  "
                >
                  {copy.handmade}
                </p>
              </div>

              {/* CORNERS */}

              <span
                aria-hidden="true"
                className="
                  absolute
                  start-5
                  top-5
                  h-8
                  w-8
                  border-s
                  border-t
                  border-accent/35
                "
              />

              <span
                aria-hidden="true"
                className="
                  absolute
                  bottom-5
                  end-5
                  h-8
                  w-8
                  border-b
                  border-e
                  border-accent/35
                "
              />
            </div>
          </div>

          {/* =================================================
              RIGHT — STORY
          ================================================= */}

          <div
            className="
              mx-auto
              w-full
              max-w-[720px]

              lg:mx-0
              lg:max-w-none
            "
          >
            {/* EYEBROW */}

            <div
              className="
                flex
                items-center
                gap-4
              "
            >
              <span
                aria-hidden="true"
                className="
                  h-px
                  w-10
                  bg-accent
                "
              />

              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.28em]
                  text-accent

                  sm:text-[10px]
                  sm:tracking-[0.32em]
                "
              >
                {copy.eyebrow}
              </p>
            </div>

            {/* TITLE */}

            <h2
              className="
                mt-7
                font-heading
                text-[44px]
                font-medium
                leading-[0.95]
                tracking-[-0.035em]
                text-foreground

                sm:text-6xl

                lg:text-[68px]

                xl:text-[76px]
              "
            >
              <span className="block">
                {copy.titleFirst}
              </span>

              <span
                className="
                  mt-1
                  block
                  text-accent
                "
              >
                {copy.titleSecond}
              </span>
            </h2>

            {/* TEXT */}

            <div
              className="
                mt-8
                max-w-[650px]
                space-y-5

                sm:mt-10
              "
            >
              <p
                className="
                  text-sm
                  leading-7
                  text-foreground-soft

                  sm:text-[15px]
                  sm:leading-8
                "
              >
                {copy.firstParagraph}
              </p>

              <p
                className="
                  text-sm
                  leading-7
                  text-foreground-soft

                  sm:text-[15px]
                  sm:leading-8
                "
              >
                {copy.secondParagraph}
              </p>
            </div>

            {/* =================================================
                VALUES
            ================================================= */}

            <div
              className="
                mt-9
                grid
                grid-cols-2
                border-y
                border-border

                sm:mt-11
              "
            >
              {/* LEATHER */}

              <div
                className="
                  flex
                  min-h-[92px]
                  items-center
                  gap-3
                  border-e
                  border-border
                  pe-4

                  sm:gap-4
                "
              >
                <span
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-accent/30
                    text-accent

                    sm:h-11
                    sm:w-11
                  "
                >
                  <Scissors
                    size={17}
                    strokeWidth={1.2}
                  />
                </span>

                <span
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    leading-5
                    tracking-[0.13em]
                    text-foreground

                    sm:text-[10px]
                    sm:tracking-[0.16em]
                  "
                >
                  {copy.leather}
                </span>
              </div>

              {/* HANDMADE */}

              <div
                className="
                  flex
                  min-h-[92px]
                  items-center
                  gap-3
                  ps-4

                  sm:gap-4
                  sm:ps-6
                "
              >
                <span
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-accent/30
                    text-accent

                    sm:h-11
                    sm:w-11
                  "
                >
                  <Hand
                    size={17}
                    strokeWidth={1.2}
                  />
                </span>

                <span
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    leading-5
                    tracking-[0.13em]
                    text-foreground

                    sm:text-[10px]
                    sm:tracking-[0.16em]
                  "
                >
                  {copy.handmade}
                </span>
              </div>
            </div>

            {/* =================================================
                CTA
            ================================================= */}

            <Link
              href={`/${locale}/about`}
              className="
                group
                mt-9
                inline-flex
                min-h-12
                items-center
                gap-4

                text-[9px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-foreground

                transition-colors
                duration-300

                hover:text-accent

                sm:mt-11
                sm:text-[10px]
              "
            >
              <span>
                {copy.action}
              </span>

              <span
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-border

                  transition-all
                  duration-500

                  group-hover:rotate-45
                  group-hover:border-accent
                  group-hover:bg-accent
                  group-hover:text-white
                "
              >
                <ArrowUpRight
                  size={15}
                  strokeWidth={1.3}
                />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}