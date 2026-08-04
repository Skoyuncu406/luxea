import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Locale } from "@/lib/i18n/config";
import { formatPrice } from "@/lib/format-price";
import type { Product } from "@/types/product";

type FeaturedProductsDictionary = {
  eyebrow: string;
  title: string;
  description: string;
  viewAll: string;
  newLabel: string;
  explore: string;
};

type FeaturedProductsProps = {
  locale: Locale;
  products: Product[];
  dictionary: FeaturedProductsDictionary;
};

export default function FeaturedProducts({
  locale,
  products,
  dictionary,
}: FeaturedProductsProps) {
  const featuredProducts = products
    .filter((product) => product.isActive && product.isFeatured)
    .sort((a, b) => a.order - b.order)
    .slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -start-40 top-24 h-[420px] w-[420px] rounded-full bg-silver/20 blur-[140px]"
      />

      <div className="container-premium relative z-10">
        <div className="flex flex-col gap-8 border-b border-border pb-10 sm:pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent sm:text-[11px]">
              {dictionary.eyebrow}
            </p>

            <h2 className="mt-4 font-heading text-4xl leading-[0.98] text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
              {dictionary.title}
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
              {dictionary.description}
            </p>
          </div>

          <Link
            href={`/${locale}/products`}
            className="group inline-flex w-fit items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground transition-colors duration-300 hover:text-accent sm:text-[11px]"
          >
            <span>{dictionary.viewAll}</span>

            <span className="flex h-9 w-9 items-center justify-center border border-border transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
              <ArrowUpRight size={15} strokeWidth={1.4} />
            </span>
          </Link>
        </div>

        <div className="mt-10 grid gap-x-6 gap-y-14 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-7">
          {featuredProducts.map((product) => (
            <article key={product.id} className="group min-w-0">
              <Link
                href={`/${locale}/products/${product.slug}`}
                className="block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                  <Image
                    src={product.image}
                    alt={product.name[locale]}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className={[
                      "object-cover transition-all duration-700 ease-out",
                      product.hoverImage
                        ? "group-hover:scale-[1.025] group-hover:opacity-0"
                        : "group-hover:scale-[1.035]",
                    ].join(" ")}
                  />

                  {product.hoverImage && (
                    <Image
                      src={product.hoverImage}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.025] group-hover:opacity-100"
                    />
                  )}

                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#242320]/20 via-transparent to-transparent"
                  />

                  {product.isNew && (
                    <span className="absolute start-4 top-4 border border-white/45 bg-black/10 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                      {dictionary.newLabel}
                    </span>
                  )}

                  <span className="absolute inset-x-4 bottom-4 translate-y-3 border border-white/40 bg-[#E5E0D7]/88 px-4 py-3 text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-foreground opacity-0 backdrop-blur-xl transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {dictionary.explore}
                  </span>
                </div>

                <div className="border-b border-border pb-5 pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-heading text-2xl leading-none text-foreground transition-colors duration-300 group-hover:text-accent sm:text-[28px]">
                      {product.name[locale]}
                    </h3>

                    <p className="shrink-0 text-[11px] font-semibold tracking-[0.08em] text-foreground">
                      {formatPrice(
                        product.price,
                        product.currency,
                        locale
                      )}
                    </p>
                  </div>

                  <p className="mt-3 line-clamp-2 text-xs leading-6 text-foreground-soft">
                    {product.shortDescription[locale]}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    {product.colors.map((color) => (
                      <span
                        key={color}
                        aria-label={color}
                        className="h-3 w-3 rounded-full border border-black/15"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}