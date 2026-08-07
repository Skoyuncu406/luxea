import { notFound } from "next/navigation";

import CartContentClient from "@/components/cart/CartContentClient";
import Navbar from "@/components/layout/Navbar";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type CartPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function CartPage({
  params,
}: CartPageProps) {
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
              {dictionary.cartPage.title}
            </h1>

            <p className="mt-6 max-w-[680px] text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
              {dictionary.cartPage.description}
            </p>
          </div>

          <CartContentClient
            locale={locale}
            dictionary={dictionary.cartPage}
          />
        </div>
      </section>
    </main>
  );
}