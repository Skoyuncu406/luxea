import Link from "next/link";
import {
  Heart,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import type { Locale } from "@/lib/i18n/config";

import LanguageSwitcher from "./LanguageSwitcher";

type NavbarDictionary = {
  navigation: {
    categories: string;
    orders: string;
  };

  common: {
    search: string;
    account: string;
    favorites: string;
    cart: string;
  };
};

type NavbarProps = {
  locale: Locale;
  dictionary: NavbarDictionary;
};

const desktopIconClass =
  "relative inline-flex h-10 w-10 shrink-0 items-center justify-center text-foreground transition-colors duration-300 hover:text-accent";

const mobileIconClass =
  "relative inline-flex h-8 w-8 shrink-0 items-center justify-center text-foreground transition-colors duration-300 hover:text-accent";

export default function Navbar({
  locale,
  dictionary,
}: NavbarProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-40 w-full">
      <div className="container-premium">
        {/* Mobil navbar */}
        <div className="lg:hidden">
          {/* Mobil üst satır */}
          <div className="grid h-[72px] grid-cols-[auto_minmax(0,1fr)_auto] items-center border-b border-border sm:h-[80px]">
            {/* Logo */}
            <div className="flex min-w-0 items-center justify-start">
              <Link
                href={`/${locale}`}
                className="shrink-0 font-heading text-[17px] font-medium uppercase tracking-[0.1em] text-foreground transition-colors duration-300 hover:text-accent min-[390px]:text-[18px] min-[390px]:tracking-[0.12em] sm:text-xl sm:tracking-[0.15em]"
              >
                Luxea
              </Link>
            </div>

            {/* Mobil ikonlar */}
            <div className="flex min-w-0 items-center justify-center gap-0 min-[390px]:gap-0.5 sm:gap-1">
              <Link
                href={`/${locale}/search`}
                aria-label={dictionary.common.search}
                title={dictionary.common.search}
                className={mobileIconClass}
              >
                <Search
                  size={17}
                  strokeWidth={1.45}
                />
              </Link>

              <Link
                href={`/${locale}/favorites`}
                aria-label={dictionary.common.favorites}
                title={dictionary.common.favorites}
                className={mobileIconClass}
              >
                <Heart
                  size={17}
                  strokeWidth={1.45}
                />
              </Link>

              <Link
                href={`/${locale}/account`}
                aria-label={dictionary.common.account}
                title={dictionary.common.account}
                className={mobileIconClass}
              >
                <UserRound
                  size={17}
                  strokeWidth={1.45}
                />
              </Link>

              <Link
                href={`/${locale}/cart`}
                aria-label={dictionary.common.cart}
                title={dictionary.common.cart}
                className={mobileIconClass}
              >
                <ShoppingBag
                  size={17}
                  strokeWidth={1.45}
                />

                <span className="absolute end-0 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent px-0.5 text-[7px] font-semibold leading-none text-white">
                  0
                </span>
              </Link>
            </div>

            {/* Mobil dil seçimi */}
            <div className="flex shrink-0 items-center justify-end border-s border-border ps-1 min-[390px]:ps-2">
              <LanguageSwitcher locale={locale} />
            </div>
          </div>

          {/* Mobil alt navigasyon */}
          <nav
            aria-label="Mobile navigation"
            className="grid h-[48px] grid-cols-2 border-b border-border"
          >
            <Link
              href={`/${locale}/products`}
              className="group relative flex min-w-0 items-center justify-center border-e border-border px-2 text-center text-[9px] font-semibold uppercase tracking-[0.13em] text-foreground transition-colors duration-300 hover:bg-surface/40 hover:text-accent min-[390px]:text-[10px] min-[390px]:tracking-[0.15em]"
            >
              <span className="truncate">
                {dictionary.navigation.categories}
              </span>

              <span className="absolute inset-x-0 bottom-0 h-px origin-center scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
            </Link>

            <Link
              href={`/${locale}/account/orders`}
              className="group relative flex min-w-0 items-center justify-center px-2 text-center text-[9px] font-semibold uppercase tracking-[0.13em] text-foreground transition-colors duration-300 hover:bg-surface/40 hover:text-accent min-[390px]:text-[10px] min-[390px]:tracking-[0.15em]"
            >
              <span className="truncate">
                {dictionary.navigation.orders}
              </span>

              <span className="absolute inset-x-0 bottom-0 h-px origin-center scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          </nav>
        </div>

        {/* Masaüstü navbar */}
        <div className="hidden h-[88px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-b border-border lg:grid">
          {/* Masaüstü logo */}
          <div className="flex min-w-0 items-center justify-start">
            <Link
              href={`/${locale}`}
              className="shrink-0 font-heading text-2xl font-medium uppercase tracking-[0.18em] text-foreground transition-colors duration-300 hover:text-accent"
            >
              Luxea
            </Link>
          </div>

          {/* Masaüstü orta navigasyon */}
          <nav
            aria-label="Main navigation"
            className="flex items-center justify-center gap-10"
          >
            <Link
              href={`/${locale}/products`}
              className="group relative whitespace-nowrap py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground transition-colors duration-300 hover:text-accent"
            >
              {dictionary.navigation.categories}

              <span className="absolute inset-x-0 bottom-1 h-px origin-center scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
            </Link>

            <Link
              href={`/${locale}/account/orders`}
              className="group relative whitespace-nowrap py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground transition-colors duration-300 hover:text-accent"
            >
              {dictionary.navigation.orders}

              <span className="absolute inset-x-0 bottom-1 h-px origin-center scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          </nav>

          {/* Masaüstü sağ alan */}
          <div className="flex min-w-0 items-center justify-end">
            <Link
              href={`/${locale}/search`}
              aria-label={dictionary.common.search}
              title={dictionary.common.search}
              className={desktopIconClass}
            >
              <Search
                size={18}
                strokeWidth={1.5}
              />
            </Link>

            <Link
              href={`/${locale}/favorites`}
              aria-label={dictionary.common.favorites}
              title={dictionary.common.favorites}
              className={desktopIconClass}
            >
              <Heart
                size={18}
                strokeWidth={1.5}
              />
            </Link>

            <Link
              href={`/${locale}/account`}
              aria-label={dictionary.common.account}
              title={dictionary.common.account}
              className={desktopIconClass}
            >
              <UserRound
                size={18}
                strokeWidth={1.5}
              />
            </Link>

            <Link
              href={`/${locale}/cart`}
              aria-label={dictionary.common.cart}
              title={dictionary.common.cart}
              className={desktopIconClass}
            >
              <ShoppingBag
                size={18}
                strokeWidth={1.5}
              />

              <span className="absolute end-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[8px] font-semibold leading-none text-white">
                0
              </span>
            </Link>

            <div className="ms-1 border-s border-border ps-2">
              <LanguageSwitcher locale={locale} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}