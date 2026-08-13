import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Locale } from "@/lib/i18n/config";

type CategoryShowcaseDictionary = {
  title: string;
  description: string;
  viewAll: string;
};

type CategoryShowcaseProps = {
  locale: Locale;
  dictionary: CategoryShowcaseDictionary;
};

export default function CategoryShowcase({
  locale,
  dictionary,
}: CategoryShowcaseProps) {
  return (
    <section className="relative overflow-hidden bg-transparent">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-28 top-1/2 h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-accent/8 blur-[100px]"
      />

      <div className="container-premium relative z-10">
        <div className="flex flex-col gap-5 border-b border-white/20 py-8 sm:py-9 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:py-10">
          <div className="max-w-[760px]">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.28em] text-accent sm:text-[10px]">
              LUXEA
            </p>

            <h2 className="font-heading text-[34px] leading-[0.98] text-foreground sm:text-4xl lg:text-[46px] xl:text-[52px]">
              {dictionary.title}
            </h2>

            <p className="mt-3 max-w-2xl text-xs leading-6 text-foreground-soft sm:text-sm sm:leading-7">
              {dictionary.description}
            </p>
          </div>

          <Link
            href={`/${locale}/categories`}
            className="group inline-flex w-fit shrink-0 items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.17em] text-foreground transition-colors duration-300 hover:text-accent sm:text-[10px]"
          >
            <span>{dictionary.viewAll}</span>

            <span className="flex h-8 w-8 items-center justify-center border border-border/70 bg-[#E5E0D7]/25 backdrop-blur-sm transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:!text-white">
              <ArrowUpRight
                size={14}
                strokeWidth={1.4}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}