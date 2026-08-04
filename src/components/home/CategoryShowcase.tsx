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
    <section className="relative overflow-hidden bg-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-40 top-0 h-[420px] w-[420px] rounded-full bg-accent/8 blur-[130px]"
      />

      <div className="container-premium relative z-10">
        <div className="flex flex-col gap-8 border-b border-border py-20 sm:py-24 lg:flex-row lg:items-end lg:justify-between lg:py-28">
          <div className="max-w-3xl">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent sm:text-[11px]">
              LUXEA
            </p>

            <h2 className="font-heading text-4xl leading-[0.98] text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
              {dictionary.title}
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
              {dictionary.description}
            </p>
          </div>

          <Link
            href={`/${locale}/categories`}
            className="group inline-flex w-fit items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground transition-colors duration-300 hover:text-accent sm:text-[11px]"
          >
            <span>{dictionary.viewAll}</span>

            <span className="flex h-9 w-9 items-center justify-center border border-border transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:!text-white">
              <ArrowUpRight
                size={15}
                strokeWidth={1.4}
              />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}