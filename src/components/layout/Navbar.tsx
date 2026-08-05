"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  Search,
  UserRound,
} from "lucide-react";

import CartNavLink from "./CartNavLink";
import FavoritesNavLink from "./FavoritesNavLink";
import LanguageSwitcher from "./LanguageSwitcher";

import { categories } from "@/data/categories";
import type { Locale } from "@/lib/i18n/config";

type NavbarDictionary = {
  navigation: {
    categories: string;
    allCategories: string;
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
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] =
    useState(false);

  const isHomePage =
    pathname === `/${locale}` ||
    pathname === `/${locale}/`;

  const shouldShowBackground =
    !isHomePage ||
    isScrolled ||
    isMobileCategoriesOpen;

  const visibleCategories = categories
    .filter((category) => category.isActive)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMobileCategoriesOpen(false);
  }, [pathname]);

  function closeMobileCategories() {
    setIsMobileCategoriesOpen(false);
  }

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-[500] w-full overflow-visible",
        "transition-[background-color,box-shadow,backdrop-filter] duration-500",
        "ease-[cubic-bezier(0.22,1,0.36,1)]",
        shouldShowBackground
          ? "bg-[#E5E0D7]/95 shadow-[0_8px_30px_rgba(36,35,32,0.06)] backdrop-blur-xl"
          : "bg-transparent shadow-none backdrop-blur-none",
      ].join(" ")}
    >
      <div className="container-premium overflow-visible">
        {/* =========================================================
            MOBİL + TABLET
        ========================================================= */}
        <div className="relative lg:hidden">
          {/* Üst satır */}
          <div
            className={[
              "grid h-[72px] grid-cols-[auto_minmax(0,1fr)_auto] items-center",
              "transition-[border-color] duration-500 sm:h-[80px]",
              shouldShowBackground
                ? "border-b border-border"
                : "border-b border-transparent",
            ].join(" ")}
          >
            {/* Logo */}
            <div className="flex min-w-0 items-center justify-start">
              <Link
                href={`/${locale}`}
                onClick={closeMobileCategories}
                aria-label="LUXEA"
                className="group relative flex shrink-0 items-center"
              >
                <span
                  className={[
                    "relative block shrink-0 overflow-hidden",
                    "h-[48px] w-[68px]",
                    "min-[390px]:h-[50px] min-[390px]:w-[72px]",
                    "sm:h-[56px] sm:w-[82px]",
                  ].join(" ")}
                >
                  <Image
                    src="/luxea-2.jpg"
                    alt="LUXEA"
                    fill
                    priority
                    sizes="(max-width: 389px) 68px, (max-width: 639px) 72px, 82px"
                    className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </span>
              </Link>
            </div>

            {/* Mobil ikonlar */}
            <div className="flex min-w-0 items-center justify-center gap-0 min-[390px]:gap-0.5 sm:gap-1">
              <Link
                href={`/${locale}/products`}
                aria-label={dictionary.common.search}
                title={dictionary.common.search}
                className={mobileIconClass}
                onClick={closeMobileCategories}
              >
                <Search
                  size={17}
                  strokeWidth={1.45}
                />
              </Link>

              <FavoritesNavLink
                locale={locale}
                label={dictionary.common.favorites}
                variant="mobile"
                onNavigate={closeMobileCategories}
              />

              <Link
                href={`/${locale}/account`}
                aria-label={dictionary.common.account}
                title={dictionary.common.account}
                className={mobileIconClass}
                onClick={closeMobileCategories}
              >
                <UserRound
                  size={17}
                  strokeWidth={1.45}
                />
              </Link>

              <CartNavLink
                locale={locale}
                label={dictionary.common.cart}
                variant="mobile"
                onNavigate={closeMobileCategories}
              />
            </div>

            {/* Mobil dil seçimi */}
            <div
              className={[
                "flex shrink-0 items-center justify-end ps-1",
                "transition-[border-color] duration-500 min-[390px]:ps-2",
                shouldShowBackground
                  ? "border-s border-border"
                  : "border-s border-transparent",
              ].join(" ")}
            >
              <LanguageSwitcher locale={locale} />
            </div>
          </div>

          {/* Mobil alt navigasyon */}
          <nav
            aria-label="Mobile navigation"
            className={[
              "grid h-[48px] grid-cols-2",
              "transition-[border-color,background-color] duration-500",
              shouldShowBackground
                ? "border-b border-border"
                : "border-b border-transparent",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() =>
                setIsMobileCategoriesOpen(
                  (current) => !current
                )
              }
              aria-expanded={isMobileCategoriesOpen}
              aria-controls="mobile-category-menu"
              className={[
                "group relative flex min-w-0 items-center justify-center gap-2 px-2",
                "text-center text-[9px] font-semibold uppercase tracking-[0.13em]",
                "transition-[color,background-color,border-color] duration-300",
                "min-[390px]:text-[10px] min-[390px]:tracking-[0.15em]",
                shouldShowBackground
                  ? "border-e border-border"
                  : "border-e border-transparent",
                isMobileCategoriesOpen
                  ? "bg-surface/55 text-accent"
                  : "text-foreground hover:bg-surface/40 hover:text-accent",
              ].join(" ")}
            >
              <span className="truncate">
                {dictionary.navigation.categories}
              </span>

              <ChevronDown
                size={13}
                strokeWidth={1.4}
                className={[
                  "shrink-0 transition-transform duration-300",
                  isMobileCategoriesOpen
                    ? "rotate-180"
                    : "",
                ].join(" ")}
              />

              <span
                className={[
                  "absolute inset-x-0 bottom-0 h-px origin-center bg-accent",
                  "transition-transform duration-300",
                  isMobileCategoriesOpen
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100",
                ].join(" ")}
              />
            </button>

            <Link
              href={`/${locale}/account/orders`}
              onClick={closeMobileCategories}
              className={[
                "group relative flex min-w-0 items-center justify-center px-2",
                "text-center text-[9px] font-semibold uppercase tracking-[0.13em]",
                "text-foreground transition-colors duration-300",
                "hover:bg-surface/40 hover:text-accent",
                "min-[390px]:text-[10px] min-[390px]:tracking-[0.15em]",
              ].join(" ")}
            >
              <span className="truncate">
                {dictionary.navigation.orders}
              </span>

              <span className="absolute inset-x-0 bottom-0 h-px origin-center scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          </nav>

          {/* Mobil kategori dropdown */}
          <div
            id="mobile-category-menu"
            className={[
              "absolute inset-x-0 top-full z-[600] overflow-hidden",
              "border-b border-border bg-[#EEEAE3]",
              "shadow-[0_24px_55px_rgba(36,35,32,0.16)]",
              "transition-all duration-500",
              "ease-[cubic-bezier(0.22,1,0.36,1)]",
              isMobileCategoriesOpen
                ? "visible max-h-[70dvh] translate-y-0 opacity-100"
                : "invisible pointer-events-none max-h-0 -translate-y-2 opacity-0",
            ].join(" ")}
          >
            <div className="max-h-[70dvh] overflow-y-auto px-4 py-5 sm:px-6">
              {/* Tüm kategoriler */}
              <Link
                href={`/${locale}/categories`}
                onClick={closeMobileCategories}
                className={[
                  "group mb-4 flex items-center justify-between",
                  "border-b border-border pb-5 text-foreground",
                  "transition-colors duration-300 hover:text-accent",
                ].join(" ")}
              >
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-accent">
                    LUXEA
                  </p>

                  <p className="mt-2 font-heading text-3xl leading-none">
                    {dictionary.navigation.allCategories}
                  </p>
                </div>

                <ArrowUpRight
                  size={18}
                  strokeWidth={1.35}
                  className={[
                    "transition-transform duration-300",
                    "group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
                    "rtl:group-hover:-translate-x-0.5",
                  ].join(" ")}
                />
              </Link>

              {/* Mobil kategori listesi */}
              <div className="grid grid-cols-2 border-s border-t border-border">
                {visibleCategories.map(
                  (category, index) => (
                    <Link
                      key={category.id}
                      href={`/${locale}/categories/${category.slug}`}
                      onClick={
                        closeMobileCategories
                      }
                      className={[
                        "group relative min-w-0",
                        "border-e border-b border-border",
                        "px-3 py-5 transition-colors duration-300",
                        "hover:bg-background/50 hover:text-accent sm:px-5",
                      ].join(" ")}
                    >
                      <span className="block text-[8px] font-medium tracking-[0.18em] text-muted">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <span
                        className={[
                          "mt-2 block whitespace-normal break-words",
                          "font-heading text-[23px] leading-[1.05]",
                          "text-foreground transition-colors duration-300",
                          "group-hover:text-accent sm:text-[27px]",
                        ].join(" ")}
                      >
                        {category.name[locale]}
                      </span>

                      <span
                        className={[
                          "mt-4 block h-px w-7 bg-border-strong",
                          "transition-all duration-300",
                          "group-hover:w-12 group-hover:bg-accent",
                        ].join(" ")}
                      />
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            MASAÜSTÜ
        ========================================================= */}
        <div
          className={[
            "hidden h-[88px]",
            "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
            "items-center overflow-visible lg:grid",
            "transition-[border-color] duration-500",
            shouldShowBackground
              ? "border-b border-border"
              : "border-b border-transparent",
          ].join(" ")}
        >
          {/* Masaüstü logo */}
          <div className="flex min-w-0 items-center justify-start">
            <Link
              href={`/${locale}`}
              aria-label="LUXEA"
              className="group relative flex shrink-0 items-center"
            >
              <span className="relative block h-[66px] w-[96px] shrink-0 overflow-hidden xl:h-[70px] xl:w-[102px]">
                <Image
                  src="/luxea-2.jpg"
                  alt="LUXEA"
                  fill
                  priority
                  sizes="(min-width: 1280px) 102px, 96px"
                  className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </span>
            </Link>
          </div>

          {/* Masaüstü orta navigasyon */}
          <nav
            aria-label="Main navigation"
            className="flex items-center justify-center gap-10 overflow-visible"
          >
            {/* Kategori dropdown */}
            <div className="group relative">
              <button
                type="button"
                aria-haspopup="true"
                className={[
                  "relative inline-flex items-center gap-2 whitespace-nowrap py-3",
                  "text-[11px] font-medium uppercase tracking-[0.18em]",
                  "text-foreground transition-colors duration-300",
                  "group-hover:text-accent group-focus-within:text-accent",
                ].join(" ")}
              >
                <span>
                  {dictionary.navigation.categories}
                </span>

                <ChevronDown
                  size={13}
                  strokeWidth={1.4}
                  className={[
                    "transition-transform duration-300",
                    "group-hover:rotate-180",
                    "group-focus-within:rotate-180",
                  ].join(" ")}
                />

                <span
                  className={[
                    "absolute inset-x-0 bottom-1 h-px",
                    "origin-center scale-x-0 bg-accent",
                    "transition-transform duration-300",
                    "group-hover:scale-x-100",
                    "group-focus-within:scale-x-100",
                  ].join(" ")}
                />
              </button>

              {/* Hover köprüsü */}
              <div
                aria-hidden="true"
                className={[
                  "fixed left-1/2 top-[72px] h-8",
                  "w-[22.222vw] min-w-[380px] max-w-[520px]",
                  "-translate-x-1/2",
                ].join(" ")}
              />

              {/* Masaüstü kategori dropdown */}
              <div
                className={[
                  "invisible pointer-events-none fixed left-1/2 top-[88px] z-[600]",
                  "w-[22.222vw] min-w-[380px] max-w-[520px]",
                  "-translate-x-1/2 translate-y-3 opacity-0",
                  "transition-all duration-300",
                  "ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "group-hover:visible group-hover:pointer-events-auto",
                  "group-hover:translate-y-0 group-hover:opacity-100",
                  "group-focus-within:visible group-focus-within:pointer-events-auto",
                  "group-focus-within:translate-y-0 group-focus-within:opacity-100",
                ].join(" ")}
              >
                <div className="border border-border bg-[#EEEAE3] p-5 shadow-[0_24px_65px_rgba(36,35,32,0.15)]">
                  {/* Başlık */}
                  <div className="flex items-center justify-between gap-5 border-b border-border pb-5">
                    <div className="min-w-0">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.26em] text-accent">
                        LUXEA
                      </p>

                      <h2 className="mt-2 font-heading text-[30px] leading-none text-foreground">
                        {
                          dictionary.navigation
                            .allCategories
                        }
                      </h2>
                    </div>

                    <Link
                      href={`/${locale}/categories`}
                      aria-label={
                        dictionary.navigation
                          .allCategories
                      }
                      className={[
                        "group/all flex h-9 w-9 shrink-0",
                        "items-center justify-center",
                        "border border-border text-foreground",
                        "transition-all duration-300",
                        "hover:border-accent hover:bg-accent hover:!text-white",
                      ].join(" ")}
                    >
                      <ArrowUpRight
                        size={15}
                        strokeWidth={1.35}
                      />
                    </Link>
                  </div>

                  {/* Kategoriler */}
                  <div className="mt-5 grid grid-cols-2 border-s border-t border-border">
                    {visibleCategories.map(
                      (category, index) => (
                        <Link
                          key={category.id}
                          href={`/${locale}/categories/${category.slug}`}
                          className={[
                            "group/item relative min-h-[96px] min-w-0",
                            "border-e border-b border-border",
                            "px-4 py-4 transition-colors duration-300",
                            "hover:bg-background/55",
                          ].join(" ")}
                        >
                          <span className="block text-[7px] font-medium tracking-[0.18em] text-muted">
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </span>

                          <span
                            className={[
                              "mt-2 block whitespace-normal break-words",
                              "font-heading text-[20px] leading-[1.05]",
                              "text-foreground transition-colors duration-300",
                              "group-hover/item:text-accent",
                            ].join(" ")}
                          >
                            {category.name[locale]}
                          </span>

                          <span
                            className={[
                              "absolute bottom-4 start-4 h-px w-6",
                              "bg-border-strong transition-all duration-300",
                              "group-hover/item:w-10",
                              "group-hover/item:bg-accent",
                            ].join(" ")}
                          />
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Siparişlerim */}
            <Link
              href={`/${locale}/account/orders`}
              className={[
                "group relative whitespace-nowrap py-3",
                "text-[11px] font-medium uppercase tracking-[0.18em]",
                "text-foreground transition-colors duration-300",
                "hover:text-accent",
              ].join(" ")}
            >
              {dictionary.navigation.orders}

              <span
                className={[
                  "absolute inset-x-0 bottom-1 h-px",
                  "origin-center scale-x-0 bg-accent",
                  "transition-transform duration-300",
                  "group-hover:scale-x-100",
                ].join(" ")}
              />
            </Link>
          </nav>

          {/* Masaüstü sağ alan */}
          <div className="flex min-w-0 items-center justify-end">
            <Link
              href={`/${locale}/products`}
              aria-label={dictionary.common.search}
              title={dictionary.common.search}
              className={desktopIconClass}
            >
              <Search
                size={18}
                strokeWidth={1.5}
              />
            </Link>

            <FavoritesNavLink
              locale={locale}
              label={dictionary.common.favorites}
              variant="desktop"
            />

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

            <CartNavLink
              locale={locale}
              label={dictionary.common.cart}
              variant="desktop"
            />

            <div
              className={[
                "ms-1 ps-2 transition-[border-color] duration-500",
                shouldShowBackground
                  ? "border-s border-border"
                  : "border-s border-transparent",
              ].join(" ")}
            >
              <LanguageSwitcher locale={locale} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}