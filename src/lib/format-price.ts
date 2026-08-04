import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/types/product";

const localeMap: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-GB",
  ar: "ar-AE",
};

export function formatPrice(
  price: number,
  currency: Product["currency"],
  locale: Locale
) {
  return new Intl.NumberFormat(localeMap[locale], {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}