import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import ProductsCatalogClient from "@/components/products/ProductsCatalogClient";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type ProductsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function ProductsPage({
  params,
}: ProductsPageProps) {
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

      <section className="pt-[120px] sm:pt-[128px] lg:pt-[88px]">
        <div className="container-premium py-12 sm:py-16 lg:py-20">
          <div className="mx-auto flex w-full max-w-[900px] flex-col items-center text-center">
            <p className="w-full text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-accent sm:text-[11px]">
              LUXEA
            </p>

            <h1 className="mt-4 w-full text-center font-heading text-[44px] leading-[0.95] text-foreground sm:text-6xl lg:text-7xl xl:text-[82px]">
              {
                dictionary.productsPage
                  .title
              }
            </h1>

            <p className="mx-auto mt-6 w-full max-w-[680px] text-center text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
              {
                dictionary.productsPage
                  .description
              }
            </p>
          </div>

          <div className="mt-10 sm:mt-12 lg:mt-14">
            <ProductsCatalogClient
              locale={locale}
              dictionary={
                dictionary.productsPage
              }
            />
          </div>
        </div>
      </section>
    </main>
  );
}