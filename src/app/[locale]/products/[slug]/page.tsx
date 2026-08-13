import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import ProductDetailClient from "@/components/products/ProductDetailClient";

import {
  isValidLocale,
} from "@/lib/i18n/config";

import {
  getDictionary,
} from "@/lib/i18n/get-dictionary";

type ProductDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const {
    locale,
    slug,
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
      {/* ORTAK ARKA PLAN KAPLAMASI */}

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

          pt-[120px]

          sm:pt-[128px]

          lg:pt-[88px]
        "
      >
        <div
          className="
            container-premium

            py-10

            sm:py-14

            lg:py-16
          "
        >
          <ProductDetailClient
            locale={locale}
            slug={slug}
            dictionary={
              dictionary
                .productDetail
            }
            newLabel={
              dictionary
                .featuredProducts
                .newLabel
            }
          />
        </div>
      </section>
    </main>
  );
}