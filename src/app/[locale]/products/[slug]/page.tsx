import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/format-price";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isValidLocale } from "@/lib/i18n/config";

type ProductDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const product = products.find(
    (item) => item.slug === slug && item.isActive
  );

  if (!product) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar locale={locale} dictionary={dictionary} />

      <section className="pt-[120px] sm:pt-[128px] lg:pt-[88px]">
        <div className="container-premium py-10 sm:py-14 lg:py-16">
          <Link
            href={`/${locale}/products`}
            className="group inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors duration-300 hover:text-accent"
          >
            <ArrowLeft
              size={15}
              strokeWidth={1.4}
              className="transition-transform duration-300 group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1"
            />

            <span>{dictionary.productDetail.backToProducts}</span>
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
            {/* Görsel alanı */}
            <div className="lg:col-span-7">
              <div className="grid gap-4 sm:grid-cols-2 lg:h-[calc(100dvh-190px)] lg:min-h-[620px] lg:max-h-[780px] lg:grid-rows-[minmax(0,1.45fr)_minmax(0,1fr)]">
                {/* Ana görsel */}
                <div className="relative min-h-[420px] overflow-hidden bg-surface sm:col-span-2 sm:min-h-[540px] lg:min-h-0">
                  <Image
                    src={product.image}
                    alt={product.name[locale]}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover object-center"
                  />

                  {product.isNew && (
                    <span className="absolute start-5 top-5 border border-white/45 bg-black/15 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                      {dictionary.featuredProducts.newLabel}
                    </span>
                  )}
                </div>

                {/* İkinci görsel */}
                {product.hoverImage && (
                  <div className="relative min-h-[300px] overflow-hidden bg-surface sm:min-h-[360px] lg:min-h-0">
                    <Image
                      src={product.hoverImage}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 29vw"
                      className="object-cover object-center"
                    />
                  </div>
                )}

                {/* Üçüncü görsel */}
                <div className="relative hidden min-h-[300px] overflow-hidden bg-surface sm:block sm:min-h-[360px] lg:min-h-0">
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 50vw, 29vw"
                    className="scale-110 object-cover object-center"
                  />

                  <div className="absolute inset-0 bg-[#E5E0D7]/18" />
                </div>
              </div>
            </div>

            {/* Ürün bilgisi */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-[112px]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent sm:text-[11px]">
                  LUXEA
                </p>

                <h1 className="mt-4 font-heading text-5xl leading-[0.95] text-foreground sm:text-6xl lg:text-[64px] xl:text-7xl">
                  {product.name[locale]}
                </h1>

                <p className="mt-6 text-lg font-semibold tracking-[0.04em] text-foreground">
                  {formatPrice(
                    product.price,
                    product.currency,
                    locale
                  )}
                </p>

                <p className="mt-6 text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
                  {product.shortDescription[locale]}
                </p>

                <div className="mt-9 border-y border-border py-6">
                  <div className="flex items-center justify-between gap-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
                      {dictionary.productDetail.color}
                    </p>

                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                      {dictionary.productDetail.selectColor}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {product.colors.map((color, index) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`${dictionary.productDetail.color} ${
                          index + 1
                        }`}
                        className={[
                          "relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300",
                          index === 0
                            ? "border-foreground"
                            : "border-border hover:border-foreground",
                        ].join(" ")}
                      >
                        <span
                          className="h-6 w-6 rounded-full border border-black/10"
                          style={{ backgroundColor: color }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-b border-border py-6">
                  <div className="flex items-center justify-between gap-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
                      {dictionary.productDetail.quantity}
                    </p>

                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                      {product.stock > 0
                        ? dictionary.productDetail.inStock
                        : dictionary.productDetail.outOfStock}
                    </p>
                  </div>

                  <div className="mt-5 inline-flex h-12 items-center border border-border">
                    <button
                      type="button"
                      aria-label={dictionary.productDetail.decrease}
                      className="flex h-full w-12 items-center justify-center text-foreground transition-colors duration-300 hover:text-accent"
                    >
                      <Minus size={14} strokeWidth={1.5} />
                    </button>

                    <span className="flex h-full min-w-12 items-center justify-center border-x border-border text-sm">
                      1
                    </span>

                    <button
                      type="button"
                      aria-label={dictionary.productDetail.increase}
                      className="flex h-full w-12 items-center justify-center text-foreground transition-colors duration-300 hover:text-accent"
                    >
                      <Plus size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    className="inline-flex min-h-14 flex-1 items-center justify-center gap-3 border border-[#242320] bg-[#242320] px-7 text-[10px] font-semibold uppercase tracking-[0.16em] !text-[#F3F0EA] transition-all duration-300 hover:border-[#92734A] hover:bg-[#92734A] hover:!text-white"
                  >
                    <ShoppingBag size={17} strokeWidth={1.4} />

                    <span className="!text-[#F3F0EA]">
                      {dictionary.productDetail.addToCart}
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-label={dictionary.productDetail.addToFavorites}
                    className="inline-flex min-h-14 min-w-14 items-center justify-center border border-foreground text-foreground transition-all duration-300 hover:bg-foreground hover:!text-[#F3F0EA]"
                  >
                    <Heart size={18} strokeWidth={1.4} />
                  </button>
                </div>

                <div className="mt-9 divide-y divide-border border-y border-border">
                  <details className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[10px] font-semibold uppercase tracking-[0.17em]">
                      <span>{dictionary.productDetail.details}</span>

                      <Plus
                        size={15}
                        strokeWidth={1.4}
                        className="transition-transform duration-300 group-open:rotate-45"
                      />
                    </summary>

                    <p className="pt-4 text-sm leading-7 text-foreground-soft">
                      {dictionary.productDetail.detailsText}
                    </p>
                  </details>

                  <details className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[10px] font-semibold uppercase tracking-[0.17em]">
                      <span>{dictionary.productDetail.shipping}</span>

                      <Plus
                        size={15}
                        strokeWidth={1.4}
                        className="transition-transform duration-300 group-open:rotate-45"
                      />
                    </summary>

                    <p className="pt-4 text-sm leading-7 text-foreground-soft">
                      {dictionary.productDetail.shippingText}
                    </p>
                  </details>

                  <details className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[10px] font-semibold uppercase tracking-[0.17em]">
                      <span>{dictionary.productDetail.returns}</span>

                      <Plus
                        size={15}
                        strokeWidth={1.4}
                        className="transition-transform duration-300 group-open:rotate-45"
                      />
                    </summary>

                    <p className="pt-4 text-sm leading-7 text-foreground-soft">
                      {dictionary.productDetail.returnsText}
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}