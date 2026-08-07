"use client";

import Link from "next/link";
import { LoaderCircle, Tags } from "lucide-react";

import { useCategories } from "@/contexts/CategoryContext";
import type { Locale } from "@/lib/i18n/config";

type CategoriesContentDictionary = {
  categoriesTitle: string;
  description: string;
};

type CategoriesContentClientProps = {
  locale: Locale;
  dictionary: CategoriesContentDictionary;
};

export default function CategoriesContentClient({
  locale,
  dictionary,
}: CategoriesContentClientProps) {
  const {
    categories,
    isLoaded,
  } = useCategories();

  const visibleCategories = [...categories]
    .filter(
      (category) => category.isActive
    )
    .sort(
      (a, b) => a.order - b.order
    );

  if (!isLoaded) {
    return (
      <div className="flex min-h-[420px] w-full items-center justify-center border-y border-border text-center">
        <div>
          <LoaderCircle
            size={26}
            strokeWidth={1.3}
            className="mx-auto animate-spin text-accent"
          />

          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
            {locale === "tr"
              ? "Kategoriler yükleniyor"
              : locale === "ar"
                ? "جارٍ تحميل الفئات"
                : "Loading categories"}
          </p>
        </div>
      </div>
    );
  }

  if (visibleCategories.length === 0) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center border-y border-border px-5 text-center">
        <span className="flex h-20 w-20 items-center justify-center border border-accent/30 bg-accent/10 text-accent">
          <Tags
            size={31}
            strokeWidth={1.2}
          />
        </span>

        <h2 className="mt-7 font-heading text-4xl leading-none text-foreground sm:text-5xl">
          {locale === "tr"
            ? "Aktif kategori bulunmuyor."
            : locale === "ar"
              ? "لا توجد فئات نشطة."
              : "No active categories found."}
        </h2>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
      <p className="w-full text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-accent sm:text-[11px]">
        LUXEA
      </p>

      <h1 className="mt-4 w-full text-center font-heading text-4xl leading-none sm:text-5xl lg:text-7xl">
        {dictionary.categoriesTitle}
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
        {dictionary.description}
      </p>

      <div className="mt-14 w-full divide-y divide-border border-y border-border">
        {visibleCategories.map(
          (category, index) => (
            <Link
              key={category.id}
              href={`/${locale}/categories/${category.slug}`}
              className={[
                "group flex w-full",
                "items-center justify-between",
                "gap-6 py-6 text-start",
                "transition-colors duration-300",
                "hover:text-accent",
                "sm:py-8",
              ].join(" ")}
            >
              <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-muted">
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </span>

                <div className="min-w-0">
                  <h2 className="break-words font-heading text-3xl leading-none sm:text-4xl lg:text-5xl">
                    {
                      category.name[
                        locale
                      ]
                    }
                  </h2>

                  <p className="mt-2 break-words text-[10px] uppercase tracking-[0.2em] text-accent">
                    {
                      category.eyebrow[
                        locale
                      ]
                    }
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-2xl transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
                →
              </span>
            </Link>
          )
        )}
      </div>
    </div>
  );
}