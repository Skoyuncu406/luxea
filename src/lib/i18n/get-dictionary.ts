import type { Locale } from "./config";

const dictionaries = {
  tr: () =>
    import("@/dictionaries/tr").then((module) => module.default),

  en: () =>
    import("@/dictionaries/en").then((module) => module.default),

  ar: () =>
    import("@/dictionaries/ar").then((module) => module.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}