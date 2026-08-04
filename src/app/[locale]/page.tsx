import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

import CategoryShowcase from "@/components/home/CategoryShowcase";

import FeaturedProducts from "@/components/home/FeaturedProducts";
import { products } from "@/data/products";
type HomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function HomePage({
  params,
}: HomePageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const isTurkish = locale === "tr";

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-background text-foreground">
      <Navbar
        locale={locale}
        dictionary={dictionary}
      />

      <section className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden pt-[120px] sm:pt-[128px] lg:pt-[88px]">
        {/* Hero arka plan görseli */}
        <div className="absolute inset-0">
          <Image
            src="/Hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Genel açık overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#E5E0D7]/68"
        />

        {/* Orta metin alanı */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(238,234,227,0.9)_0%,rgba(229,224,215,0.7)_38%,rgba(229,224,215,0.42)_68%,rgba(229,224,215,0.27)_100%)]"
        />

        {/* Navbar okunabilirliği */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[210px] bg-gradient-to-b from-[#E5E0D7]/95 via-[#E5E0D7]/72 to-transparent sm:h-[220px] lg:h-[150px]"
        />

        {/* Alt yumuşak geçiş */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[25%] bg-gradient-to-t from-[#D9D3C9]/80 to-transparent sm:h-[30%]"
        />

        {/* Hero içeriği */}
        <div className="container-premium relative z-10 flex w-full justify-center py-8 sm:py-12 lg:py-24">
          <div className="flex w-full max-w-[1100px] flex-col items-center text-center">
            <p className="mb-4 w-full text-center text-[10px] font-medium uppercase tracking-[0.22em] text-accent sm:mb-5 sm:text-[11px] sm:tracking-[0.28em] lg:mb-6 lg:text-xs lg:tracking-[0.32em]">
              {dictionary.hero.eyebrow}
            </p>

            {isTurkish ? (
              <>
                {/* Mobil ve tablet */}
                <h1 className="w-full text-center font-heading text-[clamp(2.3rem,9.5vw,4.75rem)] leading-[1] text-foreground lg:hidden">
                  {dictionary.hero.title}
                </h1>

                {/* Masaüstü */}
                <h1 className="hidden w-full text-center font-heading text-[80px] leading-[0.98] text-foreground lg:block xl:text-[92px] 2xl:text-[100px]">
                  <span className="block">
                    Detaylarda saklı olan
                  </span>

                  <span className="block">
                    zamansız zarafet.
                  </span>
                </h1>
              </>
            ) : (
              <h1 className="w-full text-center font-heading text-[clamp(2.3rem,9.5vw,4.75rem)] leading-[1] text-foreground lg:text-[80px] lg:leading-[0.98] xl:text-[92px] 2xl:text-[100px]">
                {dictionary.hero.title}
              </h1>
            )}

            <p className="mt-5 w-full max-w-[640px] text-center text-[13px] leading-6 text-foreground-soft sm:mt-7 sm:text-base sm:leading-8 md:mt-8 md:text-lg">
              {dictionary.hero.description}
            </p>

            <div className="mt-8 flex w-full flex-col items-center justify-center gap-4 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-5 lg:mt-12 lg:gap-6">
              <Link
                href={`/${locale}/products`}
                className="inline-flex min-h-12 w-full max-w-[320px] shrink-0 items-center justify-center border border-[#242320] bg-[#242320] px-6 text-center text-[10px] font-semibold uppercase tracking-[0.13em] !text-[#F3F0EA] transition-all duration-300 hover:border-[#92734A] hover:bg-[#92734A] hover:!text-white sm:min-h-14 sm:w-auto sm:max-w-none sm:px-9 sm:text-xs sm:tracking-[0.18em]"
              >
                <span className="whitespace-nowrap !text-[#F3F0EA] group-hover:!text-white">
                  {dictionary.hero.primaryAction}
                </span>
              </Link>

              <Link
                href={`/${locale}/about`}
                className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-3 text-center text-[10px] uppercase tracking-[0.13em] text-foreground transition-colors duration-300 hover:text-accent sm:min-h-14 sm:gap-4 sm:text-xs sm:tracking-[0.18em]"
              >
                <span className="whitespace-nowrap">
                  {dictionary.hero.secondaryAction}
                </span>

                <span className="hidden w-20 items-center sm:flex">
                  <span className="h-px w-12 bg-accent transition-[width] duration-300 ease-out group-hover:w-20" />
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Alt dekoratif çizgi */}
        <div className="absolute inset-inline-0 bottom-4 z-10 sm:bottom-6 lg:bottom-8">
          <div className="container-premium">
            <div className="premium-line" />
          </div>
        </div>
      </section>
      <CategoryShowcase
  locale={locale}
 
  dictionary={dictionary.categoryShowcase}
/>
      <FeaturedProducts
        locale={locale}
        products={products}
        dictionary={dictionary.featuredProducts}
      />
    </main>
  );
}