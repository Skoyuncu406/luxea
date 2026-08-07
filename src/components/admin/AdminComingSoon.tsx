import Link from "next/link";
import {
  ArrowRight,
  Construction,
} from "lucide-react";

import type { Locale } from "@/lib/i18n/config";

type AdminComingSoonProps = {
  locale: Locale;
  title: string;
  description: string;
  backLabel: string;
};

export default function AdminComingSoon({
  locale,
  title,
  description,
  backLabel,
}: AdminComingSoonProps) {
  return (
    <section className="flex min-h-[520px] w-full items-center justify-center border border-border bg-surface/45 px-5 py-14 text-center sm:px-8">
      <div className="mx-auto flex w-full max-w-[650px] flex-col items-center">
        <span className="flex h-20 w-20 items-center justify-center border border-accent/35 bg-accent/10 text-accent">
          <Construction
            size={31}
            strokeWidth={1.2}
          />
        </span>

        <p className="mt-8 text-[9px] font-semibold uppercase tracking-[0.3em] text-accent">
          LUXEA ADMIN
        </p>

        <h2 className="mt-4 text-balance font-heading text-5xl leading-[0.95] text-foreground sm:text-6xl">
          {title}
        </h2>

        <p className="mx-auto mt-6 max-w-[560px] text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
          {description}
        </p>

        <Link
          href={`/${locale}/admin`}
          className={[
            "group mt-9 inline-flex min-h-14",
            "items-center justify-center gap-3",
            "border border-foreground",
            "bg-foreground px-8",
            "text-[9px] font-semibold uppercase",
            "tracking-[0.17em]",
            "!text-[#F3F0EA]",
            "transition-all duration-300",
            "hover:border-accent",
            "hover:bg-accent",
            "hover:!text-white",
          ].join(" ")}
        >
          <span>{backLabel}</span>

          <ArrowRight
            size={15}
            strokeWidth={1.4}
            className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}