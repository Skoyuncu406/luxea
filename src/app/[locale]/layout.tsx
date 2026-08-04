import type { Metadata } from "next";
import PageLoader from "@/components/layout/PageLoader";
import {
  Cormorant_Garamond,
  Manrope,
  Noto_Naskh_Arabic,
  Noto_Sans_Arabic,
} from "next/font/google";
import { notFound } from "next/navigation";

import {
  getDirection,
  isValidLocale,
  locales,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

import "../globals.css";

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
  children: React.ReactNode;
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

  return (
    <html
      lang={locale}
      dir={direction}
      data-locale={locale}
      suppressHydrationWarning
    >
<body
  className={[
    headingFont.variable,
    bodyFont.variable,
    arabicHeadingFont.variable,
    arabicBodyFont.variable,
    isArabic ? "font-arabic" : "font-latin",
  ].join(" ")}
>
  <PageLoader />

  {children}
</body>
    </html>
  );
}