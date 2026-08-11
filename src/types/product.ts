import type { Locale } from "@/lib/i18n/config";

export type ProductLocalizedText = Record<
  Locale,
  string
>;

export type Product = {
  id: string;
  slug: string;
  categoryId: string;

  name: ProductLocalizedText;
  shortDescription: ProductLocalizedText;

  /*
   * Ürün kartında ve ürün detayında
   * kullanılan ana görsel.
   */
  image: string;

  /*
   * Ürün kartında hover sırasında
   * kullanılan ikinci görsel.
   */
  hoverImage?: string;

  /*
   * Ürün detay galerisinde gösterilecek
   * sınırsız sayıdaki ilave görseller.
   *
   * Ana görsel ve hover görseli
   * bu dizinin içerisinde tutulmaz.
   */
  additionalImages: string[];

  price: number;
  currency: "EUR" | "USD" | "GBP";

  colors: string[];

  order: number;
  stock: number;

  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
};