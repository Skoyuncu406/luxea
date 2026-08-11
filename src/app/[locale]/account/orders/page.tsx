import {
  notFound,
} from "next/navigation";

import Navbar from "@/components/layout/Navbar";

import MyOrdersContent from "@/components/orders/MyOrdersContent";

import OrderTrackingContent from "@/components/orders/OrderTrackingContent";

import {
  isValidLocale,
} from "@/lib/i18n/config";

import {
  getDictionary,
} from "@/lib/i18n/get-dictionary";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type OrdersPageProps = {
  params: Promise<{
    locale: string;
  }>;

  searchParams: Promise<{
    code?:
      | string
      | string[];
  }>;
};

/*
 * ============================================================
 * PAGE
 * ============================================================
 */

export default async function OrdersPage({
  params,
  searchParams,
}: OrdersPageProps) {
  const {
    locale,
  } = await params;

  const resolvedSearchParams =
    await searchParams;

  if (
    !isValidLocale(
      locale
    )
  ) {
    notFound();
  }

  const dictionary =
    await getDictionary(
      locale
    );

  const rawCode =
    resolvedSearchParams.code;

  const initialTrackingCode =
    typeof rawCode ===
    "string"
      ? rawCode
          .trim()
          .toUpperCase()
      : "";

  return (
    <>
      <Navbar
        locale={locale}
        dictionary={dictionary}
      />

      <main
        className="
          min-h-screen
          bg-background
          text-foreground
        "
      >
        <section
          className="
            pt-[120px]
            sm:pt-[128px]
            lg:pt-[88px]
          "
        >
          <div
            className="
              container-premium
              pb-12
              pt-7
              sm:pb-14
              sm:pt-8
              lg:pb-16
              lg:pt-8
            "
          >
            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div
              className="
                mx-auto
                flex
                w-full
                max-w-[820px]
                flex-col
                items-center
                text-center
              "
            >
              <p
                className="
                  w-full
                  text-center
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.28em]
                  text-accent
                  sm:text-[10px]
                "
              >
                LUXEA
              </p>

              <h1
                className="
                  mt-2
                  w-full
                  text-balance
                  text-center
                  font-heading
                  text-[38px]
                  leading-[0.96]
                  text-foreground
                  sm:text-[46px]
                  lg:text-[54px]
                  xl:text-[60px]
                "
              >
                {
                  dictionary
                    .ordersPage
                    .title
                }
              </h1>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-[620px]
                  text-center
                  text-xs
                  leading-6
                  text-foreground-soft
                  sm:text-sm
                  sm:leading-7
                "
              >
                {
                  dictionary
                    .ordersPage
                    .description
                }
              </p>
            </div>

            {/* =================================================
                TRACKING CODE SEARCH

                Arama alanını kullanıcı sipariş listesinin üstüne
                alıyoruz. Böylece "Sipariş Takibi" ve
                "Siparişinizi Bul" aynı viewport içerisinde
                birlikte görünür.
            ================================================= */}

            <OrderTrackingContent
              locale={locale}
              dictionary={
                dictionary.ordersPage
              }
              initialTrackingCode={
                initialTrackingCode
              }
            />

            {/* =================================================
                USER ACCOUNT ORDERS
            ================================================= */}

            <MyOrdersContent
              locale={locale}
            />
          </div>
        </section>
      </main>
    </>
  );
}