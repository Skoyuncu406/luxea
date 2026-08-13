import {
  notFound,
} from "next/navigation";

import Navbar from "@/components/layout/Navbar";

import ProductsCatalogClient from "@/components/products/ProductsCatalogClient";

import {
  isValidLocale,
} from "@/lib/i18n/config";

import {
  getDictionary,
} from "@/lib/i18n/get-dictionary";

type ProductsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function ProductsPage({
  params,
}: ProductsPageProps) {
  const {
    locale,
  } = await params;

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

  return (
    <main
      className="
        relative
        min-h-screen
        w-full
        overflow-x-clip

        bg-transparent

        text-foreground
      "
    >
      {/* =====================================================
          ORTAK YÜZEY
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-0

          bg-[#E5E0D7]/18

          backdrop-blur-[0.5px]
        "
      />

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar
        locale={locale}
        dictionary={dictionary}
      />

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <section
        className="
          relative
          z-10

          pt-[116px]

          sm:pt-[124px]

          lg:pt-[84px]
        "
      >
        <div
          className="
            container-premium

            py-12

            sm:py-14

            lg:py-16
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
              max-w-[900px]
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
                tracking-[0.34em]

                text-accent

                sm:text-[10px]
              "
            >
              LUXEA
            </p>

            <h1
              className="
                mt-4
                w-full

                text-center

                font-heading
                font-semibold

                text-[44px]

                leading-[0.94]

                tracking-[-0.04em]

                text-foreground

                sm:text-6xl

                lg:text-[72px]

                xl:text-[80px]
              "
            >
              {
                dictionary
                  .productsPage
                  .title
              }
            </h1>

            <p
              className="
                mx-auto
                mt-6

                w-full
                max-w-[680px]

                text-center

                text-sm
                leading-7

                text-foreground-soft

                sm:text-[15px]
                sm:leading-8
              "
            >
              {
                dictionary
                  .productsPage
                  .description
              }
            </p>
          </div>

          {/* =================================================
              CATALOG
          ================================================= */}

          <div
            className="
              mt-10

              sm:mt-12

              lg:mt-14
            "
          >
            <ProductsCatalogClient
              locale={locale}
              dictionary={
                dictionary
                  .productsPage
              }
            />
          </div>
        </div>
      </section>
    </main>
  );
}