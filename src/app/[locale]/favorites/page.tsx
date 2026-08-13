import {
  notFound,
} from "next/navigation";

import FavoritesContentClient from "@/components/favorites/FavoritesContentClient";
import Navbar from "@/components/layout/Navbar";

import {
  isValidLocale,
} from "@/lib/i18n/config";

import {
  getDictionary,
} from "@/lib/i18n/get-dictionary";

type FavoritesPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function FavoritesPage({
  params,
}: FavoritesPageProps) {
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
          ORTAK ARKA PLAN
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

      <Navbar
        locale={locale}
        dictionary={dictionary}
      />

      <section
        className="
          relative
          z-10

          min-h-[100dvh]

          pt-[120px]

          sm:pt-[128px]

          lg:pt-[88px]
        "
      >
        <div
          className="
            container-premium

            py-10

            sm:py-12

            lg:py-14
          "
        >
          {/* PAGE HEADER */}

          <div
            className="
              mx-auto

              flex
              max-w-[900px]
              flex-col

              items-center

              text-center
            "
          >
            <p
              className="
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
                  .favoritesPage
                  .title
              }
            </h1>

            <p
              className="
                mt-6
                max-w-[680px]

                text-sm
                leading-7

                text-foreground-soft

                sm:text-[15px]
                sm:leading-8
              "
            >
              {
                dictionary
                  .favoritesPage
                  .description
              }
            </p>
          </div>

          {/* FAVORITES */}

          <FavoritesContentClient
            locale={locale}
            dictionary={
              dictionary
                .favoritesPage
            }
          />
        </div>
      </section>
    </main>
  );
}