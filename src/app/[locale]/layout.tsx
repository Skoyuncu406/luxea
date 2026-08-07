import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Cormorant_Garamond,
  Manrope,
  Noto_Naskh_Arabic,
  Noto_Sans_Arabic,
} from "next/font/google";
import { notFound } from "next/navigation";
import { CartProvider } from "@/contexts/CartContext";
import { OrderProvider } from "@/contexts/OrderContext";
import PageLoader from "@/components/layout/PageLoader";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import {
  getDirection,
  isValidLocale,
  locales,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { CategoryProvider } from "@/contexts/CategoryContext";

import "../globals.css";
import { ProductProvider } from "@/contexts/ProductContext";

const headingFont = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const arabicHeadingFont = Noto_Naskh_Arabic({
  variable: "--font-heading-arabic",
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const arabicBodyFont = Noto_Sans_Arabic({
  variable: "--font-body-arabic",
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

type LocaleLayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
}>;

export function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const dictionary = await getDictionary(locale);

  return {
    title: {
      default: dictionary.metadata.title,
      template: `%s | ${dictionary.metadata.title}`,
    },
    description: dictionary.metadata.description,
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 5,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const direction = getDirection(locale);
  const isArabic = locale === "ar";

  const bodyClassName = [
    headingFont.variable,
    bodyFont.variable,
    arabicHeadingFont.variable,
    arabicBodyFont.variable,
    isArabic ? "font-arabic" : "font-latin",
    "min-h-screen bg-background text-foreground",
  ].join(" ");

  return (
    <html
      lang={locale}
      dir={direction}
      data-locale={locale}
      suppressHydrationWarning
    >
      <body className={bodyClassName}>
<CategoryProvider>
  <ProductProvider>
    <FavoritesProvider>
      <CartProvider>
        <OrderProvider>
          <PageLoader />
          {children}
        </OrderProvider>
      </CartProvider>
    </FavoritesProvider>
  </ProductProvider>
</CategoryProvider>
      </body>
    </html>
  );
}