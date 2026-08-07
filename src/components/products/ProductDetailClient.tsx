"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";

import ProductActions from "@/components/products/ProductActions";
import { useProducts } from "@/contexts/ProductContext";
import type { Locale } from "@/lib/i18n/config";

type ProductDetailDictionary = {
  backToProducts: string;
  color: string;
  selectColor: string;
  quantity: string;
  inStock: string;
  outOfStock: string;
  decrease: string;
  increase: string;
  addToCart: string;
  addToFavorites: string;
  details: string;
  detailsText: string;
  shipping: string;
  shippingText: string;
  returns: string;
  returnsText: string;
  addedToCart: string;
};

type ProductDetailClientProps = {
  locale: Locale;
  slug: string;
  dictionary: ProductDetailDictionary;
  newLabel: string;
};

type FullscreenPreviewProps = {
  src: string;
  alt: string;
};

function FullscreenPreview({
  src,
  alt,
}: FullscreenPreviewProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "pointer-events-none fixed inset-0 z-[700]",
        "hidden items-center justify-center p-8 lg:flex",
        "bg-[#242320]/88 opacity-0 backdrop-blur-md",
        "transition-opacity duration-500",
        "group-hover/preview:opacity-100",
      ].join(" ")}
    >
      <div className="relative h-[88dvh] w-[88vw] max-w-[1500px]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="88vw"
          className="object-contain object-center drop-shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
        />
      </div>

      <div className="absolute inset-x-0 bottom-7 flex justify-center">
        <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-white/55">
          LUXEA
        </p>
      </div>
    </div>
  );
}

function ProductLoadingState() {
  return (
    <div className="flex min-h-[520px] items-center justify-center border-y border-border px-5 text-center">
      <div>
        <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />

        <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted">
          Ürün yükleniyor
        </p>
      </div>
    </div>
  );
}

function ProductNotFoundState({
  locale,
}: {
  locale: Locale;
}) {
  const title =
    locale === "tr"
      ? "Ürün bulunamadı."
      : locale === "ar"
        ? "لم يتم العثور على المنتج."
        : "Product not found.";

  const description =
    locale === "tr"
      ? "Bu ürün kaldırılmış, pasif duruma getirilmiş veya bağlantısı değiştirilmiş olabilir."
      : locale === "ar"
        ? "قد يكون هذا المنتج قد تمت إزالته أو تعطيله أو تغيير رابطه."
        : "This product may have been removed, deactivated, or its link may have changed.";

  const backLabel =
    locale === "tr"
      ? "Ürünlere Dön"
      : locale === "ar"
        ? "العودة إلى المنتجات"
        : "Back to Products";

  return (
    <div className="flex min-h-[520px] items-center justify-center border-y border-border px-5 py-16 text-center">
      <div className="mx-auto flex max-w-[620px] flex-col items-center">
        <span className="flex h-20 w-20 items-center justify-center border border-accent/30 bg-accent/10 text-accent">
          <PackageSearch
            size={31}
            strokeWidth={1.15}
          />
        </span>

        <h1 className="mt-7 font-heading text-5xl leading-none text-foreground sm:text-6xl">
          {title}
        </h1>

        <p className="mt-6 max-w-[540px] text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
          {description}
        </p>

        <Link
          href={`/${locale}/products`}
          className={[
            "group mt-9 inline-flex min-h-14",
            "items-center justify-center gap-3",
            "border border-foreground",
            "bg-foreground px-7",
            "text-[9px] font-semibold uppercase",
            "tracking-[0.16em]",
            "!text-[#F3F0EA]",
            "transition-all duration-300",
            "hover:border-accent",
            "hover:bg-accent",
            "hover:!text-white",
          ].join(" ")}
        >
          <ArrowLeft
            size={15}
            strokeWidth={1.4}
            className="transition-transform duration-300 group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1"
          />

          <span>{backLabel}</span>
        </Link>
      </div>
    </div>
  );
}

export default function ProductDetailClient({
  locale,
  slug,
  dictionary,
  newLabel,
}: ProductDetailClientProps) {
  const {
    isLoaded,
    findProductBySlug,
  } = useProducts();

  if (!isLoaded) {
    return <ProductLoadingState />;
  }

  const product = findProductBySlug(slug);

  if (!product || !product.isActive) {
    return (
      <ProductNotFoundState locale={locale} />
    );
  }

  return (
    <>
      <Link
        href={`/${locale}/products`}
        className="group inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors duration-300 hover:text-accent"
      >
        <ArrowLeft
          size={15}
          strokeWidth={1.4}
          className="transition-transform duration-300 group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1"
        />

        <span>{dictionary.backToProducts}</span>
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-12 xl:gap-16">
        {/* Ürün görselleri */}
        <div className="min-w-0 lg:col-span-7">
          <div className="w-full">
            {/* Ana görsel */}
            <div className="group/preview relative mx-auto aspect-[4/5] w-full max-w-[720px] cursor-zoom-in overflow-hidden bg-surface sm:aspect-[5/6] lg:h-[calc(100dvh-230px)] lg:min-h-[560px] lg:max-h-[720px] lg:aspect-auto">
              <Image
                src={product.image}
                alt={product.name[locale]}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover object-center transition-transform duration-700 ease-out lg:group-hover/preview:scale-[1.025]"
              />

              <div className="pointer-events-none absolute inset-0 bg-[#242320]/0 transition-colors duration-500 lg:group-hover/preview:bg-[#242320]/10" />

              <div className="pointer-events-none absolute inset-x-5 bottom-5 hidden translate-y-3 items-center justify-center opacity-0 transition-all duration-500 lg:flex lg:group-hover/preview:translate-y-0 lg:group-hover/preview:opacity-100">
                <span className="border border-white/40 bg-[#E5E0D7]/90 px-5 py-3 text-[8px] font-semibold uppercase tracking-[0.22em] text-foreground backdrop-blur-xl">
                  {locale === "tr"
                    ? "Tam Ekran Görüntüle"
                    : locale === "ar"
                      ? "عرض بملء الشاشة"
                      : "View Fullscreen"}
                </span>
              </div>

              {product.isNew && (
                <span className="absolute start-4 top-4 z-10 border border-white/45 bg-black/15 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md sm:start-5 sm:top-5">
                  {newLabel}
                </span>
              )}

              <FullscreenPreview
                src={product.image}
                alt={product.name[locale]}
              />
            </div>

            {/* Küçük galeri */}
            <div className="mt-4 flex items-start gap-3 overflow-x-auto pb-2 sm:mt-5 sm:gap-4 lg:overflow-visible">
              {product.hoverImage && (
                <div className="group/preview relative aspect-[4/5] w-[28%] min-w-[92px] max-w-[150px] shrink-0 cursor-zoom-in overflow-hidden border border-border bg-surface sm:w-[24%] sm:min-w-[120px] lg:w-[23%] lg:max-w-[160px]">
                  <Image
                    src={product.hoverImage}
                    alt={`${product.name[locale]} - 2`}
                    fill
                    sizes="(max-width: 640px) 28vw, (max-width: 1024px) 24vw, 160px"
                    className="object-cover object-center transition-transform duration-500 lg:group-hover/preview:scale-[1.06]"
                  />

                  <div className="pointer-events-none absolute inset-0 border-0 border-accent transition-all duration-300 lg:group-hover/preview:border" />

                  <FullscreenPreview
                    src={product.hoverImage}
                    alt={`${product.name[locale]} - 2`}
                  />
                </div>
              )}

              <div className="group/preview relative aspect-[4/5] w-[28%] min-w-[92px] max-w-[150px] shrink-0 cursor-zoom-in overflow-hidden border border-border bg-surface sm:w-[24%] sm:min-w-[120px] lg:w-[23%] lg:max-w-[160px]">
                <Image
                  src={product.image}
                  alt={`${product.name[locale]} - 3`}
                  fill
                  sizes="(max-width: 640px) 28vw, (max-width: 1024px) 24vw, 160px"
                  className="scale-[1.15] object-cover object-center transition-transform duration-500 lg:group-hover/preview:scale-[1.22]"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[#E5E0D7]/12"
                />

                <div className="pointer-events-none absolute inset-0 border-0 border-accent transition-all duration-300 lg:group-hover/preview:border" />

                <FullscreenPreview
                  src={product.image}
                  alt={`${product.name[locale]} - 3`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ürün işlemleri */}
        <div className="min-w-0 lg:col-span-5">
          <div className="lg:sticky lg:top-[112px]">
            <ProductActions
              locale={locale}
              product={product}
              dictionary={dictionary}
            />
          </div>
        </div>
      </div>
    </>
  );
}