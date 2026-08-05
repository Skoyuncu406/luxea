import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import ProductActions from "@/components/products/ProductActions";
import { products } from "@/data/products";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type ProductDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
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

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const product = products.find(
    (item) =>
      item.slug === slug &&
      item.isActive
  );

  if (!product) {
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

            <span>
              {dictionary.productDetail.backToProducts}
            </span>
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
                      Tam Ekran Görüntüle
                    </span>
                  </div>

                  {product.isNew && (
                    <span className="absolute start-4 top-4 z-10 border border-white/45 bg-black/15 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md sm:start-5 sm:top-5">
                      {
                        dictionary.featuredProducts
                          .newLabel
                      }
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
                  dictionary={dictionary.productDetail}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}