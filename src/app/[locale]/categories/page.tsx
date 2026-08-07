import { notFound } from "next/navigation";

import CategoriesContentClient from "@/components/categories/CategoriesContentClient";
import Navbar from "@/components/layout/Navbar";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

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

  const dictionary =
    await getDictionary(locale);

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-background text-foreground">
      <Navbar
        locale={locale}
        dictionary={dictionary}
      />

      <section className="flex min-h-[100dvh] items-center pt-[120px] sm:pt-[128px] lg:pt-[88px]">
        <div className="container-premium w-full py-14 sm:py-16 lg:py-20">
          <CategoriesContentClient
            locale={locale}
            dictionary={{
              categoriesTitle:
                dictionary.navigation
                  .categories,
              description:
                dictionary
                  .categoryShowcase
                  .description,
            }}
          />
        </div>
      </section>
    </main>
  );
}