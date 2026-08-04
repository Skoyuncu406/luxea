import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import { categories } from "@/data/categories";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isValidLocale } from "@/lib/i18n/config";

type CategoryPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const category = categories.find(
    (item) => item.slug === slug && item.isActive
  );

  if (!category) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar locale={locale} dictionary={dictionary} />

      <section className="flex min-h-[100dvh] items-center pt-[120px] sm:pt-[128px] lg:pt-[88px]">
        <div className="container-premium w-full py-14 sm:py-16 lg:py-20">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            <p className="w-full text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-accent sm:text-[11px]">
              {category.eyebrow[locale]}
            </p>

            <h1 className="mt-4 w-full text-center font-heading text-5xl leading-none sm:text-6xl lg:text-8xl">
              {category.name[locale]}
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
              Bu kategoriye ait ürünler backend aşamasında dinamik olarak burada
              listelenecek.
            </p>

            <Link
              href={`/${locale}/products`}
              className="mt-10 inline-flex min-h-12 items-center justify-center border border-[#242320] bg-transparent px-7 text-[10px] font-semibold uppercase tracking-[0.16em] !text-[#242320] transition-all duration-300 hover:bg-[#242320] hover:!text-[#F3F0EA]"
            >
              <span className="whitespace-nowrap text-inherit">
                {dictionary.categoryShowcase.viewAll}
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}