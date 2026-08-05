import { notFound } from "next/navigation";

import CheckoutContent from "@/components/checkout/CheckoutContent";
import Navbar from "@/components/layout/Navbar";
import { products } from "@/data/products";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type CheckoutPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function CheckoutPage({
  params,
}: CheckoutPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar
        locale={locale}
        dictionary={dictionary}
      />

      <section className="pt-[120px] sm:pt-[128px] lg:pt-[88px]">
        <div className="container-premium py-14 sm:py-16 lg:py-20">
          <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent sm:text-[11px]">
              LUXEA
            </p>

            <h1 className="mt-4 font-heading text-[44px] leading-[0.95] text-foreground sm:text-6xl lg:text-7xl xl:text-[82px]">
              {dictionary.checkoutPage.title}
            </h1>

            <p className="mt-6 max-w-[680px] text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
              {dictionary.checkoutPage.description}
            </p>
          </div>

          <CheckoutContent
            locale={locale}
            products={products}
            dictionary={dictionary.checkoutPage}
          />
        </div>
      </section>
    </main>
  );
}