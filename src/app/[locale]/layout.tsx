import type {
  Metadata,
  Viewport,
} from "next";

import type {
  ReactNode,
} from "react";

import {
  Manrope,
  Noto_Naskh_Arabic,
  Noto_Sans_Arabic,
} from "next/font/google";

import {
  notFound,
} from "next/navigation";

import PageLoader from "@/components/layout/PageLoader";

import {
  CartProvider,
} from "@/contexts/CartContext";

import {
  CategoryProvider,
} from "@/contexts/CategoryContext";

import {
  FavoritesProvider,
} from "@/contexts/FavoritesContext";

import {
  OrderProvider,
} from "@/contexts/OrderContext";

import {
  ProductProvider,
} from "@/contexts/ProductContext";

import {
  UserProvider,
} from "@/contexts/UserContext";

import {
  getDirection,
  isValidLocale,
  locales,
} from "@/lib/i18n/config";

import {
  getDictionary,
} from "@/lib/i18n/get-dictionary";

import "../globals.css";

/*
 * =============================================================
 * FONTS
 * =============================================================
 *
 * Cormorant Garamond geçici olarak kaldırıldı.
 *
 * Google Fonts / Turbopack tarafında oluşan 404 problemi
 * nedeniyle Latin başlıklarda da Manrope kullanıyoruz.
 *
 * --font-heading değişkenini koruduğumuz için mevcut
 * font-heading Tailwind sınıflarını değiştirmemiz gerekmiyor.
 * =============================================================
 */

/*
 * Latin başlık fontu
 */
const headingFont =
  Manrope({
    variable:
      "--font-heading",

    subsets: [
      "latin",
    ],

    display:
      "swap",

    weight: [
      "500",
      "600",
      "700",
    ],
  });

/*
 * Latin gövde fontu
 */
const bodyFont =
  Manrope({
    variable:
      "--font-body",

    subsets: [
      "latin",
    ],

    display:
      "swap",

    weight: [
      "400",
      "500",
      "600",
      "700",
    ],
  });

/*
 * Arapça başlık fontu
 */
const arabicHeadingFont =
  Noto_Naskh_Arabic({
    variable:
      "--font-heading-arabic",

    subsets: [
      "arabic",
    ],

    display:
      "swap",

    weight: [
      "400",
      "500",
      "600",
      "700",
    ],
  });

/*
 * Arapça gövde fontu
 */
const arabicBodyFont =
  Noto_Sans_Arabic({
    variable:
      "--font-body-arabic",

    subsets: [
      "arabic",
    ],

    display:
      "swap",

    weight: [
      "400",
      "500",
      "600",
      "700",
    ],
  });

/*
 * =============================================================
 * TYPES
 * =============================================================
 */

type LocaleLayoutProps =
  Readonly<{
    children:
      ReactNode;

    params:
      Promise<{
        locale:
          string;
      }>;
  }>;

/*
 * =============================================================
 * STATIC PARAMS
 * =============================================================
 */

export function generateStaticParams() {
  return locales.map(
    (locale) => ({
      locale,
    })
  );
}

/*
 * =============================================================
 * VIEWPORT
 * =============================================================
 */

export const viewport:
  Viewport = {
    width:
      "device-width",

    initialScale:
      1,

    maximumScale:
      5,
  };

/*
 * =============================================================
 * METADATA
 * =============================================================
 */

export async function generateMetadata({
  params,
}: Pick<
  LocaleLayoutProps,
  "params"
>): Promise<Metadata> {
  const {
    locale,
  } = await params;

  if (
    !isValidLocale(
      locale
    )
  ) {
    return {};
  }

  const dictionary =
    await getDictionary(
      locale
    );

  return {
    title: {
      default:
        dictionary
          .metadata
          .title,

      template:
        `%s | ${dictionary.metadata.title}`,
    },

    description:
      dictionary
        .metadata
        .description,
  };
}

/*
 * =============================================================
 * LAYOUT
 * =============================================================
 */

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
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

  const direction =
    getDirection(
      locale
    );

  const isArabic =
    locale ===
    "ar";

  /*
   * Tüm font CSS variable'larını body üzerine ekliyoruz.
   *
   * Böylece globals.css / Tailwind tarafındaki:
   *
   * font-heading
   * font-body
   * font-arabic
   *
   * yapıları çalışmaya devam eder.
   */
  const bodyClassName = [
    headingFont.variable,

    bodyFont.variable,

    arabicHeadingFont.variable,

    arabicBodyFont.variable,

    isArabic
      ? "font-arabic"
      : "font-latin",

    "min-h-screen bg-background text-foreground",
  ].join(" ");

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
    >
      <body
        className={
          bodyClassName
        }
      >
        <CategoryProvider>
          <ProductProvider>
            <FavoritesProvider>
              <CartProvider>
                <UserProvider>
                  <OrderProvider>
                    <PageLoader />

                    {children}
                  </OrderProvider>
                </UserProvider>
              </CartProvider>
            </FavoritesProvider>
          </ProductProvider>
        </CategoryProvider>
      </body>
    </html>
  );
}