import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import OrderTrackingContent from "@/components/orders/OrderTrackingContent";
import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type OrdersPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function OrdersPage({
  params,
}: OrdersPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const validLocale: Locale = locale;
  const dictionary = await getDictionary(validLocale);

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-background text-foreground">
      <Navbar
        locale={validLocale}
        dictionary={dictionary}
      />

      <section className="pt-[120px] sm:pt-[128px] lg:pt-[88px]">
        <div className="container-premium py-12 sm:py-16 lg:py-20">
          {/* Sayfa başlığı */}
          <div className="mx-auto flex w-full max-w-[900px] flex-col items-center text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent sm:text-[11px]">
              LUXEA
            </p>

            <h1 className="mt-4 text-balance font-heading text-[44px] leading-[0.95] text-foreground sm:text-6xl lg:text-7xl xl:text-[82px]">
              {dictionary.ordersPage.title}
            </h1>

            <p className="mx-auto mt-6 max-w-[680px] text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
              {dictionary.ordersPage.description}
            </p>
          </div>

          {/* Sipariş takip alanı */}
          <OrderTrackingContent
            locale={validLocale}
            dictionary={dictionary.ordersPage}
          />
        </div>
      </section>
    </main>
  );
}