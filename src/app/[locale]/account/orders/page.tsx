import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import OrderTrackingContent from "@/components/orders/OrderTrackingContent";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type OrdersPageProps = {
  params: Promise<{
    locale: string;
  }>;

  searchParams: Promise<{
    code?: string | string[];
  }>;
};

export default async function OrdersPage({
  params,
  searchParams,
}: OrdersPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  const rawCode = resolvedSearchParams.code;

  const initialTrackingCode =
    typeof rawCode === "string"
      ? rawCode.trim().toUpperCase()
      : "";

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-background text-foreground">
      <Navbar
        locale={locale}
        dictionary={dictionary}
      />

      <section className="pt-[120px] sm:pt-[128px] lg:pt-[88px]">
        <div className="container-premium py-14 sm:py-16 lg:py-20">
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

          <OrderTrackingContent
            locale={locale}
            dictionary={dictionary.ordersPage}
            initialTrackingCode={initialTrackingCode}
          />
        </div>
      </section>
    </main>
  );
}