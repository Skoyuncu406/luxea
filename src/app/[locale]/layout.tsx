import type {
  Metadata,
  Viewport,
} from "next";

import Image from "next/image";

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

import ContactFooter from "@/components/layout/ContactFooter";
import PageLoader from "@/components/layout/PageLoader";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

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

import AIConcierge from "@/components/layout/AIConcierge";
import "../globals.css";

/*
 * =============================================================
 * FONTS
 * =============================================================
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

  const bodyClassName = [
    headingFont.variable,

    bodyFont.variable,

    arabicHeadingFont.variable,

    arabicBodyFont.variable,

    isArabic
      ? "font-arabic"
      : "font-latin",

    "min-h-screen bg-[#E5E0D7] text-foreground",
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
        {/*
         * =====================================================
         * SABİT SITE BACKGROUND
         * =====================================================
         *
         * Hero.png viewport'a sabitlenir.
         * Kullanıcı scroll yaptığında bu katman hareket etmez.
         * =====================================================
         */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            fixed
            inset-0
            z-0
            overflow-hidden
          "
        >
          <Image
            src="/Hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="
              object-cover
              object-center
            "
          />

          {/*
           * Görseli biraz yumuşatıyoruz.
           * İçeriklerin okunabilirliğini korurken
           * arka planın varlığı hissediliyor.
           */}
          <div
            className="
              absolute
              inset-0
              bg-[#E5E0D7]/58
              backdrop-blur-[1px]
            "
          />

          {/*
           * Çok hafif premium vignette
           */}
          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_center,transparent_20%,rgba(36,35,32,0.10)_100%)]
            "
          />
        </div>

        {/*
         * =====================================================
         * SITE CONTENT
         * =====================================================
         */}

        <div
          className="
            relative
            z-10
            min-h-screen
          "
        >
<CategoryProvider>
  <ProductProvider>
    <UserProvider>
      <FavoritesProvider>
        <CartProvider>
          <OrderProvider>
            <PageLoader />

            {children}

            <ContactFooter
              locale={locale}
            />
<AIConcierge />
            <WhatsAppButton />
          </OrderProvider>
        </CartProvider>
      </FavoritesProvider>
    </UserProvider>
  </ProductProvider>
</CategoryProvider>
        </div>
      </body>
    </html>
  );
}