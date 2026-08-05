import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import OrderCompleteContent from "@/components/orders/OrderCompleteContent";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type OrderCompletePageProps = {
  params: Promise<{
    locale: string;
    trackingCode: string;
  }>;
};

export default async function OrderCompletePage({
  params,
}: OrderCompletePageProps) {
  const { locale, trackingCode } = await params;

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
        <div className="container-premium py-12 sm:py-16 lg:py-20">
          <OrderCompleteContent
            locale={locale}
            trackingCode={decodeURIComponent(
              trackingCode
            )}
            dictionary={dictionary.orderCompletePage}
          />
        </div>
      </section>
    </main>
  );
}