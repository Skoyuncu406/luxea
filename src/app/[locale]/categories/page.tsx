import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import { categories } from "@/data/categories";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isValidLocale } from "@/lib/i18n/config";

type CategoriesPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function CategoriesPage({
  params,
}: CategoriesPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  const visibleCategories = categories
    .filter((category) => category.isActive)
    .sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar locale={locale} dictionary={dictionary} />

      <section className="flex min-h-[100dvh] items-center pt-[120px] sm:pt-[128px] lg:pt-[88px]">
        <div className="container-premium w-full py-14 sm:py-16 lg:py-20">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            <p className="w-full text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-accent sm:text-[11px]">
              LUXEA
            </p>

            <h1 className="mt-4 w-full text-center font-heading text-4xl leading-none sm:text-5xl lg:text-7xl">
              {dictionary.navigation.categories}
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
              {dictionary.categoryShowcase.description}
            </p>

            <div className="mt-14 w-full divide-y divide-border border-y border-border">
              {visibleCategories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/${locale}/categories/${category.slug}`}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-start transition-colors duration-300 hover:text-accent sm:py-8"
                >
                  <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0">
                      <h2 className="font-heading text-3xl leading-none sm:text-4xl lg:text-5xl">
                        {category.name[locale]}
                      </h2>

                      <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-accent">
                        {category.eyebrow[locale]}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 text-2xl transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}