"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  Search,
  UserRound,
  LogOut,
} from "lucide-react";

import CartNavLink from "./CartNavLink";
import FavoritesNavLink from "./FavoritesNavLink";
import LanguageSwitcher from "./LanguageSwitcher";

import { useCategories } from "@/contexts/CategoryContext";
import { useUser } from "@/contexts/UserContext";
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
  "group/icon relative inline-flex h-10 w-10 shrink-0 items-center justify-center border border-transparent text-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-border hover:bg-surface/55 hover:text-accent";

const mobileIconClass =
  "group/icon relative inline-flex h-8 w-8 shrink-0 items-center justify-center border border-transparent text-foreground transition-all duration-300 ease-out hover:border-border hover:bg-surface/45 hover:text-accent";

export default function Navbar({
  locale,
  dictionary,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  /*
   * DİNAMİK KATEGORİLER
   *
   * Artık Navbar statik categories.ts
   * dosyasını kullanmıyor.
   */
  const {
    categories,
    isLoaded: categoriesLoaded,
  } = useCategories();

  const {
    user,
    isLoaded: userLoaded,
    isAuthenticated,
    logout,
  } = useUser();

  const [
    isMobileAccountOpen,
    setIsMobileAccountOpen,
  ] = useState(false);

  const [
    isScrolled,
    setIsScrolled,
  ] = useState(false);

  const [
    isMobileCategoriesOpen,
    setIsMobileCategoriesOpen,
  ] = useState(false);

  /*
   * Ana sayfada navbar başlangıçta
   * şeffaf kalabilir.
   */
  const isHomePage =
    pathname === `/${locale}` ||
    pathname === `/${locale}/`;

  /*
   * Navbar arka plan davranışı
   */
  const shouldShowBackground =
    !isHomePage ||
    isScrolled ||
    isMobileCategoriesOpen;

  /*
   * Sadece aktif kategoriler Navbar'da
   * gösterilir.
   *
   * Admin:
   * - kategori eklerse görünür
   * - düzenlerse güncellenir
   * - pasife alırsa kaybolur
   * - silerse kaldırılır
   */
  const visibleCategories = useMemo(() => {
    if (!categoriesLoaded) {
      return [];
    }

    return [...categories]
      .filter(
        (category) =>
          category.isActive
      )
      .sort(
        (a, b) =>
          a.order - b.order
      );
  }, [
    categories,
    categoriesLoaded,
  ]);

  /*
   * Scroll kontrolü
   */
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(
        window.scrollY > 24
      );
    }

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  function closeMobileCategories() {
    setIsMobileCategoriesOpen(false);
  }

  function closeMobileAccount() {
    setIsMobileAccountOpen(false);
  }

  async function handleLogout() {
    try {
      await logout();

      setIsMobileAccountOpen(false);
      setIsMobileCategoriesOpen(false);

      router.replace(`/${locale}`);
      router.refresh();
    } catch (error) {
      console.error("Çıkış yapılamadı:", error);
    }
  }

  const accountLabel =
    locale === "tr"
      ? "Hesabım"
      : locale === "ar"
        ? "حسابي"
        : "My Account";

  const logoutLabel =
    locale === "tr"
      ? "Çıkış Yap"
      : locale === "ar"
        ? "تسجيل الخروج"
        : "Sign Out";

  const displayName =
    user?.firstName?.trim() ||
    user?.lastName?.trim() ||
    dictionary.common.account;

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-[500]",
        "w-full overflow-visible",
        "transition-[background-color,box-shadow,backdrop-filter,border-color]",
        "duration-500",
        "ease-[cubic-bezier(0.22,1,0.36,1)]",

        shouldShowBackground
          ? [
              "border-b border-white/35",
              "bg-[#E5E0D7]/88",
              "shadow-[0_10px_34px_rgba(36,35,32,0.045)]",
              "backdrop-blur-2xl",
            ].join(" ")
          : [
              "border-b border-transparent",
              "bg-transparent",
              "shadow-none",
              "backdrop-blur-none",
            ].join(" "),
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-x-0 top-0 h-px",
          "bg-gradient-to-r from-transparent via-accent/30 to-transparent",
          "transition-opacity duration-500",
          shouldShowBackground
            ? "opacity-100"
            : "opacity-0",
        ].join(" ")}
      />

      <div className="container-premium overflow-visible">
        {/* =========================================================
            MOBİL + TABLET
        ========================================================= */}
        <div className="relative lg:hidden">
          {/* Üst satır */}
          <div
            className={[
              "grid h-[70px]",
              "grid-cols-[auto_minmax(0,1fr)_auto]",
              "items-center",
              "transition-[border-color]",
              "duration-500",
              "sm:h-[78px]",

              shouldShowBackground
                ? "border-b border-border"
                : "border-b border-transparent",
            ].join(" ")}
          >
            {/* Logo */}
            <div className="flex min-w-0 items-center justify-start">
              <Link
                href={`/${locale}`}
                onClick={
                  closeMobileCategories
                }
                aria-label="LUXEA"
                className="group relative flex shrink-0 items-center"
              >
                <span
                  className={[
                    "relative block shrink-0",
                    "overflow-hidden",

                    "h-[46px] w-[66px]",

                    "min-[390px]:h-[48px]",
                    "min-[390px]:w-[70px]",

                    "sm:h-[54px]",
                    "sm:w-[80px]",
                  ].join(" ")}
                >
                  <Image
                    src="/luxea-2.jpg"
                    alt="LUXEA"
                    fill
                    priority
                    sizes="(max-width: 389px) 68px, (max-width: 639px) 72px, 82px"
                    className={[
                      "object-contain",
                      "object-center",
                      "transition-transform",
                      "duration-500",
                      "ease-out",
                      "group-hover:scale-[1.015]",
                    ].join(" ")}
                  />
                </span>
              </Link>
            </div>

            {/* Mobil ikonlar */}
            <div
              className={[
                "flex min-w-0",
                "items-center",
                "justify-center",
                "gap-0",
                "min-[390px]:gap-0.5",
                "sm:gap-1",
              ].join(" ")}
            >
              {/* Arama */}
              <Link
                href={`/${locale}/products`}
                aria-label={
                  dictionary.common.search
                }
                title={
                  dictionary.common.search
                }
                className={
                  mobileIconClass
                }
                onClick={
                  closeMobileCategories
                }
              >
                <Search
                  size={17}
                  strokeWidth={1.45}
                />
              </Link>

              {/* Favoriler */}
              <FavoritesNavLink
                locale={locale}
                label={
                  dictionary.common
                    .favorites
                }
                variant="mobile"
                onNavigate={
                  closeMobileCategories
                }
              />

              {/* Hesap */}
              {userLoaded && isAuthenticated && user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileAccountOpen(
                        (current) => !current
                      );
                      setIsMobileCategoriesOpen(false);
                    }}
                    aria-expanded={isMobileAccountOpen}
                    aria-haspopup="menu"
                    className={[
                      "inline-flex h-8 max-w-[92px] items-center gap-1.5 px-2",
                      "text-[9px] font-semibold uppercase tracking-[0.12em]",
                      "text-foreground transition-colors duration-300",
                      "hover:text-accent",
                    ].join(" ")}
                  >
                    <span className="truncate">
                      {displayName}
                    </span>

                    <ChevronDown
                      size={11}
                      strokeWidth={1.4}
                      className={[
                        "shrink-0 transition-transform duration-300",
                        isMobileAccountOpen ? "rotate-180" : "",
                      ].join(" ")}
                    />
                  </button>

                  <div
                    role="menu"
                    className={[
                      "absolute end-0 top-[calc(100%+10px)] z-[650]",
                      "w-max min-w-[180px] border border-white/40",
                      "bg-[#EEEAE3]/98 p-2 shadow-[0_22px_60px_rgba(36,35,32,0.16)]",
                      "backdrop-blur-2xl transition-all duration-300",
                      isMobileAccountOpen
                        ? "visible translate-y-0 opacity-100"
                        : "invisible pointer-events-none -translate-y-2 opacity-0",
                    ].join(" ")}
                  >
                    <Link
                      href={`/${locale}/account`}
                      onClick={() => {
                        closeMobileCategories();
                        closeMobileAccount();
                      }}
                      className={[
                        "flex min-h-10 w-full items-center whitespace-nowrap px-3.5 py-2.5",
                        "text-[9px] font-semibold uppercase tracking-[0.15em]",
                        "text-foreground transition-colors duration-300",
                        "hover:bg-white/25 hover:text-accent",
                      ].join(" ")}
                    >
                      {accountLabel}
                    </Link>

                    <div className="my-1 h-px w-full bg-border" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className={[
                        "flex min-h-10 w-full items-center gap-2 whitespace-nowrap px-3.5 py-2.5 text-start",
                        "text-[9px] font-semibold uppercase tracking-[0.15em]",
                        "text-foreground transition-colors duration-300",
                        "hover:bg-white/25 hover:text-danger",
                      ].join(" ")}
                    >
                      <LogOut
                        size={13}
                        strokeWidth={1.4}
                      />
                      <span>{logoutLabel}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href={`/${locale}/account`}
                  aria-label={
                    dictionary.common.account
                  }
                  title={
                    dictionary.common.account
                  }
                  className={
                    mobileIconClass
                  }
                  onClick={
                    closeMobileCategories
                  }
                >
                  <UserRound
                    size={17}
                    strokeWidth={1.45}
                  />
                </Link>
              )}

              {/* Sepet */}
              <CartNavLink
                locale={locale}
                label={
                  dictionary.common.cart
                }
                variant="mobile"
                onNavigate={
                  closeMobileCategories
                }
              />
            </div>

            {/* Dil seçimi */}
            <div
              className={[
                "flex shrink-0",
                "items-center",
                "justify-end",
                "ps-1",
                "transition-[border-color]",
                "duration-500",
                "min-[390px]:ps-2",

                shouldShowBackground
                  ? "border-s border-border"
                  : "border-s border-transparent",
              ].join(" ")}
            >
              <LanguageSwitcher
                locale={locale}
              />
            </div>
          </div>

          {/* =====================================================
              MOBİL ALT NAVİGASYON
          ===================================================== */}
          <nav
            aria-label="Mobile navigation"
            className={[
              "grid h-[46px]",
              "grid-cols-2",

              "transition-[border-color,background-color]",
              "duration-500",

              shouldShowBackground
                ? "border-b border-border"
                : "border-b border-transparent",
            ].join(" ")}
          >
            {/* Kategoriler */}
            <button
              type="button"
              onClick={() =>
                setIsMobileCategoriesOpen(
                  (current) =>
                    !current
                )
              }
              aria-expanded={
                isMobileCategoriesOpen
              }
              aria-controls="mobile-category-menu"
              className={[
                "group relative",
                "flex min-w-0",
                "items-center",
                "justify-center",
                "gap-2 px-2",

                "text-center",
                "text-[9px]",
                "font-semibold",
                "uppercase",
                "tracking-[0.13em]",

                "transition-[color,background-color,border-color]",
                "duration-300",

                "min-[390px]:text-[10px]",
                "min-[390px]:tracking-[0.15em]",

                shouldShowBackground
                  ? "border-e border-border"
                  : "border-e border-transparent",

                isMobileCategoriesOpen
                  ? "bg-surface/55 text-accent"
                  : "text-foreground hover:bg-surface/40 hover:text-accent",
              ].join(" ")}
            >
              <span className="truncate">
                {
                  dictionary.navigation
                    .categories
                }
              </span>

              <ChevronDown
                size={13}
                strokeWidth={1.4}
                className={[
                  "shrink-0",
                  "transition-transform",
                  "duration-300",

                  isMobileCategoriesOpen
                    ? "rotate-180"
                    : "",
                ].join(" ")}
              />

              <span
                className={[
                  "absolute inset-x-0",
                  "bottom-0 h-px",
                  "origin-center",
                  "bg-accent",
                  "transition-transform",
                  "duration-300",

                  isMobileCategoriesOpen
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100",
                ].join(" ")}
              />
            </button>

            {/* Siparişler */}
            <Link
              href={`/${locale}/account/orders`}
              onClick={
                closeMobileCategories
              }
              className={[
                "group relative",
                "flex min-w-0",
                "items-center",
                "justify-center",
                "px-2",

                "text-center",
                "text-[9px]",
                "font-semibold",
                "uppercase",
                "tracking-[0.13em]",

                "text-foreground",
                "transition-colors",
                "duration-300",

                "hover:bg-surface/40",
                "hover:text-accent",

                "min-[390px]:text-[10px]",
                "min-[390px]:tracking-[0.15em]",
              ].join(" ")}
            >
              <span className="truncate">
                {
                  dictionary.navigation
                    .orders
                }
              </span>

              <span
                className={[
                  "absolute inset-x-0",
                  "bottom-0 h-px",
                  "origin-center",
                  "scale-x-0",
                  "bg-accent",
                  "transition-transform",
                  "duration-300",
                  "group-hover:scale-x-100",
                ].join(" ")}
              />
            </Link>
          </nav>

          {/* =====================================================
              MOBİL KATEGORİ DROPDOWN
          ===================================================== */}
          <div
            id="mobile-category-menu"
            className={[
              "absolute inset-x-0 top-full",
              "z-[600] overflow-hidden",

              "border-b border-border",
              "bg-[#EEEAE3]/96 backdrop-blur-2xl",

              "shadow-[0_28px_70px_rgba(36,35,32,0.12)]",

              "transition-all duration-500",
              "ease-[cubic-bezier(0.22,1,0.36,1)]",

              isMobileCategoriesOpen
                ? [
                    "visible",
                    "max-h-[70dvh]",
                    "translate-y-0",
                    "opacity-100",
                  ].join(" ")
                : [
                    "invisible",
                    "pointer-events-none",
                    "max-h-0",
                    "-translate-y-2",
                    "opacity-0",
                  ].join(" "),
            ].join(" ")}
          >
            <div className="max-h-[70dvh] overflow-y-auto px-4 py-6 sm:px-6">
              {/* Tüm kategoriler */}
              <Link
                href={`/${locale}/categories`}
                onClick={
                  closeMobileCategories
                }
                className={[
                  "group mb-4",
                  "flex items-center",
                  "justify-between",
                  "border-b border-border",
                  "pb-5",
                  "text-foreground",
                  "transition-colors",
                  "duration-300",
                  "hover:text-accent",
                ].join(" ")}
              >
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-accent">
                    LUXEA
                  </p>

                  <p className="mt-2 font-heading text-3xl leading-none">
                    {
                      dictionary.navigation
                        .allCategories
                    }
                  </p>
                </div>

                <ArrowUpRight
                  size={18}
                  strokeWidth={1.35}
                  className={[
                    "transition-transform",
                    "duration-300",

                    "group-hover:-translate-y-0.5",
                    "group-hover:translate-x-0.5",

                    "rtl:group-hover:-translate-x-0.5",
                  ].join(" ")}
                />
              </Link>

              {/* Kategori listesi */}
              <div className="grid grid-cols-2 border-s border-t border-border">
                {categoriesLoaded &&
                  visibleCategories.map(
                    (
                      category,
                      index
                    ) => (
                      <Link
                        key={
                          category.id
                        }
                        href={`/${locale}/categories/${category.slug}`}
                        onClick={
                          closeMobileCategories
                        }
                        className={[
                          "group relative",
                          "min-w-0",

                          "border-e",
                          "border-b",
                          "border-border",

                          "px-3 py-5",

                          "transition-colors",
                          "duration-300",

                          "hover:bg-background/50",
                          "hover:text-accent",

                          "sm:px-5",
                        ].join(" ")}
                      >
                        <span className="block text-[8px] font-medium tracking-[0.18em] text-muted">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <span
                          className={[
                            "mt-2 block",
                            "whitespace-normal",
                            "break-words",

                            "font-heading",
                            "text-[23px]",
                            "leading-[1.05]",

                            "text-foreground",

                            "transition-colors",
                            "duration-300",

                            "group-hover:text-accent",

                            "sm:text-[27px]",
                          ].join(" ")}
                        >
                          {
                            category
                              .name[
                              locale
                            ]
                          }
                        </span>

                        <span
                          className={[
                            "mt-4 block",
                            "h-px w-7",

                            "bg-border-strong",

                            "transition-all",
                            "duration-300",

                            "group-hover:w-12",
                            "group-hover:bg-accent",
                          ].join(" ")}
                        />
                      </Link>
                    )
                  )}
              </div>

              {/* Yüklenme durumu */}
              {!categoriesLoaded && (
                <div className="flex min-h-28 items-center justify-center border-x border-b border-border">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted">
                    {locale === "tr"
                      ? "Kategoriler yükleniyor"
                      : locale === "ar"
                        ? "جارٍ تحميل الفئات"
                        : "Loading categories"}
                  </p>
                </div>
              )}

              {/* Aktif kategori yok */}
              {categoriesLoaded &&
                visibleCategories.length ===
                  0 && (
                  <div className="flex min-h-28 items-center justify-center border-x border-b border-border px-5 text-center">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted">
                      {locale === "tr"
                        ? "Aktif kategori bulunmuyor"
                        : locale === "ar"
                          ? "لا توجد فئات نشطة"
                          : "No active categories"}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* =========================================================
            MASAÜSTÜ
        ========================================================= */}
        <div
          className={[
            "hidden h-[84px]",
            "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
            "items-center",
            "overflow-visible",
            "lg:grid",

            "transition-[border-color]",
            "duration-500",

            shouldShowBackground
              ? "border-b border-border"
              : "border-b border-transparent",
          ].join(" ")}
        >
          {/* Logo */}
          <div className="flex min-w-0 items-center justify-start">
            <Link
              href={`/${locale}`}
              aria-label="LUXEA"
              className="group relative flex shrink-0 items-center"
            >
              {/*
               * Premium logo aura
               *
               * Desktop'ta logo hover olduğunda arkasında
               * yumuşak beyaz bir ışık oluşur.
               * Neon görünüm vermemek için opaklığı kontrollü.
               */}
              <span
                aria-hidden="true"
                className={[
                  "pointer-events-none",
                  "absolute left-1/2 top-1/2 z-0",
                  "h-[70%] w-[88%]",
                  "-translate-x-1/2 -translate-y-1/2",
                  "rounded-full",
                  "bg-white/0",
                  "blur-xl",
                  "transition-all duration-500",
                  "ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "group-hover:scale-[1.18]",
                  "group-hover:bg-white/55",
                ].join(" ")}
              />

              {/*
               * Çok ince ikinci ışık katmanı.
               * Logonun kenarlarını hover sırasında
               * daha belirgin hale getirir.
               */}
              <span
                aria-hidden="true"
                className={[
                  "pointer-events-none",
                  "absolute left-1/2 top-1/2 z-0",
                  "h-[48%] w-[72%]",
                  "-translate-x-1/2 -translate-y-1/2",
                  "rounded-full",
                  "bg-white/0",
                  "blur-md",
                  "transition-all duration-500",
                  "group-hover:bg-white/35",
                ].join(" ")}
              />

              <span className="relative z-10 block h-[62px] w-[92px] shrink-0 xl:h-[66px] xl:w-[98px]">
                <Image
                  src="/luxea-2.jpg"
                  alt="LUXEA"
                  fill
                  priority
                  sizes="(min-width: 1280px) 98px, 92px"
                  className={[
                    "object-contain",
                    "object-center",
                    "transition-all",
                    "duration-500",
                    "ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "group-hover:scale-[1.035]",
                    "group-hover:brightness-[1.08]",
                    "group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.95)]",
                  ].join(" ")}
                />
              </span>
            </Link>
          </div>

          {/* =====================================================
              MASAÜSTÜ ORTA NAVİGASYON
          ===================================================== */}
          <nav
            aria-label="Main navigation"
            className="flex items-center justify-center gap-12 overflow-visible"
          >
            {/* Kategori dropdown */}
            <div className="group relative">
              <button
                type="button"
                aria-haspopup="true"
                className={[
                  "relative inline-flex",
                  "items-center gap-2",
                  "whitespace-nowrap",
                  "py-3",

                  "text-[10px]",
                  "font-semibold",
                  "uppercase",
                  "tracking-[0.22em]",

                  "text-foreground",

                  "transition-colors",
                  "duration-300",

                  "group-hover:text-accent",
                  "group-focus-within:text-accent",
                ].join(" ")}
              >
                <span>
                  {
                    dictionary.navigation
                      .categories
                  }
                </span>

                <ChevronDown
                  size={13}
                  strokeWidth={1.4}
                  className={[
                    "transition-transform",
                    "duration-300",

                    "group-hover:rotate-180",
                    "group-focus-within:rotate-180",
                  ].join(" ")}
                />

                <span
                  className={[
                    "absolute inset-x-0",
                    "bottom-1 h-px",

                    "origin-center",
                    "scale-x-0",
                    "bg-accent",

                    "transition-transform",
                    "duration-300",

                    "group-hover:scale-x-100",
                    "group-focus-within:scale-x-100",
                  ].join(" ")}
                />
              </button>

              {/* Hover köprüsü */}
              <div
                aria-hidden="true"
                className={[
                  "fixed left-1/2",
                  "top-[72px]",
                  "h-8",

                  "w-[30vw]",
                  "min-w-[440px]",
                  "max-w-[620px]",

                  "-translate-x-1/2",
                ].join(" ")}
              />

              {/* =================================================
                  MASAÜSTÜ KATEGORİ DROPDOWN
              ================================================= */}
              <div
                className={[
                  "invisible",
                  "pointer-events-none",

                  "fixed left-1/2",
                  "top-[84px]",
                  "z-[600]",

                  "w-[30vw]",
                  "min-w-[440px]",
                  "max-w-[620px]",

                  "-translate-x-1/2",
                  "translate-y-3",
                  "opacity-0",

                  "transition-all",
                  "duration-300",

                  "ease-[cubic-bezier(0.22,1,0.36,1)]",

                  "group-hover:visible",
                  "group-hover:pointer-events-auto",
                  "group-hover:translate-y-0",
                  "group-hover:opacity-100",

                  "group-focus-within:visible",
                  "group-focus-within:pointer-events-auto",
                  "group-focus-within:translate-y-0",
                  "group-focus-within:opacity-100",
                ].join(" ")}
              >
                <div className="border border-white/45 bg-[#EEEAE3]/96 p-6 shadow-[0_30px_80px_rgba(36,35,32,0.13)] backdrop-blur-2xl">
                  {/* Başlık */}
                  <div className="flex items-center justify-between gap-6 border-b border-border pb-6">
                    <div className="min-w-0">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.26em] text-accent">
                        LUXEA
                      </p>

                      <h2 className="mt-2 font-heading text-[32px] leading-[0.95] text-foreground">
                        {
                          dictionary
                            .navigation
                            .allCategories
                        }
                      </h2>
                    </div>

                    <Link
                      href={`/${locale}/categories`}
                      aria-label={
                        dictionary
                          .navigation
                          .allCategories
                      }
                      className={[
                        "group/all flex",
                        "h-9 w-9 shrink-0",

                        "items-center",
                        "justify-center",

                        "border",
                        "border-border",

                        "text-foreground",

                        "transition-all",
                        "duration-300",

                        "hover:border-accent",
                        "hover:bg-accent",
                        "hover:!text-white",
                      ].join(" ")}
                    >
                      <ArrowUpRight
                        size={15}
                        strokeWidth={1.35}
                      />
                    </Link>
                  </div>

                  {/* Kategoriler */}
                  {categoriesLoaded ? (
                    visibleCategories.length >
                    0 ? (
                      <div className="mt-6 grid grid-cols-2 border-s border-t border-border">
                        {visibleCategories.map(
                          (
                            category,
                            index
                          ) => (
                            <Link
                              key={
                                category.id
                              }
                              href={`/${locale}/categories/${category.slug}`}
                              className={[
                                "group/item",
                                "relative",
                                "min-h-[104px]",
                                "min-w-0",

                                "border-e",
                                "border-b",
                                "border-border",

                                "px-5 py-5",

                                "transition-colors",
                                "duration-300",

                                "hover:bg-background/55",
                              ].join(
                                " "
                              )}
                            >
                              <span className="block text-[7px] font-medium tracking-[0.18em] text-muted">
                                {String(
                                  index +
                                    1
                                ).padStart(
                                  2,
                                  "0"
                                )}
                              </span>

                              <span
                                className={[
                                  "mt-2 block",
                                  "whitespace-normal",
                                  "break-words",

                                  "font-heading",
                                  "text-[22px]",
                                  "leading-[1.05]",

                                  "text-foreground",

                                  "transition-colors",
                                  "duration-300",

                                  "group-hover/item:text-accent",
                                ].join(
                                  " "
                                )}
                              >
                                {
                                  category
                                    .name[
                                    locale
                                  ]
                                }
                              </span>

                              <span
                                className={[
                                  "absolute",
                                  "bottom-5",
                                  "start-5",

                                  "h-px",
                                  "w-6",

                                  "bg-border-strong",

                                  "transition-all",
                                  "duration-300",

                                  "group-hover/item:w-10",
                                  "group-hover/item:bg-accent",
                                ].join(
                                  " "
                                )}
                              />
                            </Link>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="mt-5 flex min-h-[110px] items-center justify-center border border-border px-5 text-center">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted">
                          {locale ===
                          "tr"
                            ? "Aktif kategori bulunmuyor"
                            : locale ===
                                "ar"
                              ? "لا توجد فئات نشطة"
                              : "No active categories"}
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="mt-5 flex min-h-[110px] items-center justify-center border border-border px-5 text-center">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted">
                        {locale ===
                        "tr"
                          ? "Kategoriler yükleniyor"
                          : locale ===
                              "ar"
                            ? "جارٍ تحميل الفئات"
                            : "Loading categories"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Siparişlerim */}
            <Link
              href={`/${locale}/account/orders`}
              className={[
                "group relative",
                "whitespace-nowrap",
                "py-3",

                "text-[10px]",
                "font-semibold",
                "uppercase",
                "tracking-[0.22em]",

                "text-foreground",

                "transition-colors",
                "duration-300",

                "hover:text-accent",
              ].join(" ")}
            >
              {
                dictionary.navigation
                  .orders
              }

              <span
                className={[
                  "absolute inset-x-0",
                  "bottom-1 h-px",

                  "origin-center",
                  "scale-x-0",
                  "bg-accent",

                  "transition-transform",
                  "duration-300",

                  "group-hover:scale-x-100",
                ].join(" ")}
              />
            </Link>
          </nav>

          {/* =====================================================
              MASAÜSTÜ SAĞ ALAN
          ===================================================== */}
          <div className="flex min-w-0 items-center justify-end gap-0.5">
            {/* Arama */}
            <Link
              href={`/${locale}/products`}
              aria-label={
                dictionary.common.search
              }
              title={
                dictionary.common.search
              }
              className={
                desktopIconClass
              }
            >
              <Search
                size={18}
                strokeWidth={1.5}
              />
            </Link>

            {/* Favoriler */}
            <FavoritesNavLink
              locale={locale}
              label={
                dictionary.common
                  .favorites
              }
              variant="desktop"
            />

            {/* Hesap */}
            {userLoaded && isAuthenticated && user ? (
              <div className="group/account relative">
                <Link
                  href={`/${locale}/account`}
                  className={[
                    "relative inline-flex h-10 max-w-[180px] items-center gap-2 overflow-hidden px-3",
                    "text-[9px] font-semibold uppercase tracking-[0.16em]",
                    "text-foreground transition-colors duration-300",
                    "hover:text-accent",
                  ].join(" ")}
                >
                  <span className="truncate">
                    {displayName}
                  </span>

                  <ChevronDown
                    size={12}
                    strokeWidth={1.4}
                    className={[
                      "shrink-0 transition-transform duration-300",
                      "group-hover/account:rotate-180",
                      "group-focus-within/account:rotate-180",
                    ].join(" ")}
                  />

                  <span
                    className={[
                      "absolute inset-x-3 bottom-0 h-px origin-center scale-x-0 bg-accent",
                      "transition-transform duration-300",
                      "group-hover/account:scale-x-100",
                      "group-focus-within/account:scale-x-100",
                    ].join(" ")}
                  />
                </Link>

                <div
                  aria-hidden="true"
                  className="absolute end-0 top-full h-4 min-w-full w-[190px]"
                />

                <div
                  className={[
                    "invisible pointer-events-none absolute end-0 top-[calc(100%+8px)] z-[650]",
                    "w-max min-w-[160px] translate-y-2 opacity-0",
                    "border border-white/45 bg-[#EEEAE3]/98 p-2",
                    "shadow-[0_24px_65px_rgba(36,35,32,0.16)] backdrop-blur-2xl",
                    "transition-all duration-300",
                    "ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "group-hover/account:visible",
                    "group-hover/account:pointer-events-auto",
                    "group-hover/account:translate-y-0",
                    "group-hover/account:opacity-100",
                    "group-focus-within/account:visible",
                    "group-focus-within/account:pointer-events-auto",
                    "group-focus-within/account:translate-y-0",
                    "group-focus-within/account:opacity-100",
                  ].join(" ")}
                >
                  <Link
                    href={`/${locale}/account`}
                    className={[
                      "flex min-h-11 w-full items-center whitespace-nowrap px-4 py-3",
                      "text-[9px] font-semibold uppercase tracking-[0.15em]",
                      "text-foreground transition-colors duration-300",
                      "hover:bg-white/25 hover:text-accent",
                    ].join(" ")}
                  >
                    <span>
                      {accountLabel}
                    </span>
                  </Link>

                  <div className="my-1 h-px bg-border" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className={[
                      "flex min-h-11 w-full items-center gap-2.5 whitespace-nowrap px-4 py-3 text-start",
                      "text-[9px] font-semibold uppercase tracking-[0.15em]",
                      "text-foreground transition-colors duration-300",
                      "hover:bg-white/25 hover:text-danger",
                    ].join(" ")}
                  >
                    <LogOut
                      size={14}
                      strokeWidth={1.4}
                    />
                    <span>{logoutLabel}</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href={`/${locale}/account`}
                aria-label={
                  dictionary.common.account
                }
                title={
                  dictionary.common.account
                }
                className={
                  desktopIconClass
                }
              >
                <UserRound
                  size={18}
                  strokeWidth={1.5}
                />
              </Link>
            )}

            {/* Sepet */}
            <CartNavLink
              locale={locale}
              label={
                dictionary.common.cart
              }
              variant="desktop"
            />

            {/* Dil */}
            <div
              className={[
                "ms-2 ps-3",
                "transition-[border-color]",
                "duration-500",

                shouldShowBackground
                  ? "border-s border-border"
                  : "border-s border-transparent",
              ].join(" ")}
            >
              <LanguageSwitcher
                locale={locale}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}