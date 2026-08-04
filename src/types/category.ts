import type { Locale } from "@/lib/i18n/config";

export type LocalizedText = Record<Locale, string>;

export type Category = {
  id: string;
  slug: string;
  name: LocalizedText;
  eyebrow: LocalizedText;
  image: string;
  order: number;
  isActive: boolean;
};