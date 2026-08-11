import { notFound } from "next/navigation";

import FavoritesContentClient from "@/components/favorites/FavoritesContentClient";
import Navbar from "@/components/layout/Navbar";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type FavoritesPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function FavoritesPage({
  params,
}: FavoritesPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary =
    await getDictionary(locale);

  return (
    <main className="min-h-[100dvh] bg-background text-foreground lg:h-[100dvh] lg:overflow-y-auto">
      <Navbar
        locale={locale}
        dictionary={dictionary}
      />

      <section className="pt-[120px] sm:pt-[128px] lg:pt-[88px]">
        <div className="container-premium pb-8 pt-7 sm:pb-10 sm:pt-8 lg:pb-10 lg:pt-8">
          <div className="mx-auto flex max-w-[820px] flex-col items-center text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-accent sm:text-[10px]">
              LUXEA
            </p>

            <h1 className="mt-2 font-heading text-[38px] leading-[0.96] text-foreground sm:text-[46px] lg:text-[54px] xl:text-[60px]">
              {
                dictionary.favoritesPage
                  .title
              }
            </h1>

            <p className="mt-3 max-w-[620px] text-xs leading-6 text-foreground-soft sm:text-sm sm:leading-7">
              {
                dictionary.favoritesPage
                  .description
              }
            </p>
          </div>

          <FavoritesContentClient
            locale={locale}
            dictionary={
              dictionary.favoritesPage
            }
          />
        </div>
      </section>
    </main>
  );
}