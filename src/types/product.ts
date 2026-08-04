import type { Locale } from "@/lib/i18n/config";

export type ProductLocalizedText = Record<Locale, string>;

export type Product = {
  id: string;
  slug: string;
  categoryId: string;

  name: ProductLocalizedText;
  shortDescription: ProductLocalizedText;

  image: string;
  hoverImage?: string;

  price: number;
  currency: "EUR" | "USD" | "GBP";

  colors: string[];

  order: number;
  stock: number;

  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
};