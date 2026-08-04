"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import {
  localeNames,
  locales,
  type Locale,
} from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  locale: Locale;
};

export default function LanguageSwitcher({
  locale,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const otherLocales = locales.filter((item) => item !== locale);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Dil seçimi"
        className="group flex h-10 items-center gap-1.5 px-2 text-[11px] font-medium uppercase tracking-[0.16em] text-foreground transition-colors duration-300 hover:text-accent"
      >
        <span>{locale.toUpperCase()}</span>

        <ChevronDown
          size={13}
          strokeWidth={1.5}
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={[
          "absolute top-full z-50 min-w-[120px] pt-2",
          "end-0",
          "transition-all duration-300",
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0",
        ].join(" ")}
      >
        <div className="border border-border bg-surface/95 px-2 py-2 shadow-[0_16px_40px_rgba(40,36,30,0.10)] backdrop-blur-xl">
          {otherLocales.map((item) => (
            <Link
              key={item}
              href={`/${item}`}
              onClick={() => setIsOpen(false)}
              className="group flex items-center justify-between gap-6 px-3 py-2.5 text-[11px] text-muted transition-colors duration-300 hover:text-accent"
            >
              <span>{localeNames[item]}</span>

              <span className="text-[9px] uppercase tracking-[0.14em] opacity-60">
                {item}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}