import { notFound } from "next/navigation";

import CategoryDetailClient from "@/components/categories/CategoryDetailClient";
import Navbar from "@/components/layout/Navbar";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type CategoryPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { locale, slug } =
    await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary =
    await getDictionary(locale);

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-background text-foreground">
      <Navbar
        locale={locale}
        dictionary={dictionary}
      />

      <section className="min-h-[100dvh] pt-[120px] sm:pt-[128px] lg:pt-[88px]">
        <div className="container-premium w-full py-14 sm:py-16 lg:py-20">
          <CategoryDetailClient
            locale={locale}
            slug={slug}
            categoryDictionary={{
              viewAll:
                dictionary
                  .categoryShowcase
                  .viewAll,
              explore:
                dictionary
                  .categoryShowcase
                  .explore,
            }}
            productsDictionary={{
              newLabel:
                dictionary
                  .productsPage
                  .newLabel,
              viewProduct:
                dictionary
                  .productsPage
                  .viewProduct,
            }}
          />
        </div>
      </section>
    </main>
  );
}