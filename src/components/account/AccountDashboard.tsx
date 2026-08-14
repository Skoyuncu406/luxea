"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Heart,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  UserRound,
} from "lucide-react";

import { useUser } from "@/contexts/UserContext";

import type { Locale } from "@/lib/i18n/config";

/*
 * =============================================================
 * TYPES
 * =============================================================
 */

type AccountDashboardDictionary = {
  eyebrow: string;
  title: string;
  description: string;

  profile: string;
  profileDescription: string;

  orders: string;
  ordersDescription: string;

  addresses: string;
  addressesDescription: string;

  favorites: string;
  favoritesDescription: string;

  email: string;
  phone: string;

  logout: string;
  loggingOut: string;

  loading: string;
};

type AccountDashboardProps = {
  locale: Locale;
  dictionary: AccountDashboardDictionary;
};

type AccountLinkProps = {
  href: string;

  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;

  number: string;
  title: string;
  description: string;
  actionLabel: string;
};

/*
 * =============================================================
 * ACCOUNT DASHBOARD
 * =============================================================
 */

export default function AccountDashboard({
  locale,
  dictionary,
}: AccountDashboardProps) {
  const router = useRouter();

  const {
    user,
    isLoaded,
    isLoading,
    logout,
  } = useUser();

  /*
   * ===========================================================
   * AUTH REDIRECT
   * ===========================================================
   *
   * router.replace artık render sırasında çalışmıyor.
   *
   * UserContext yüklemesini tamamladıktan sonra kullanıcı yoksa
   * login sayfasına yönlendiriyoruz.
   */

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!user) {
      router.replace(
        `/${locale}/account/login`
      );
    }
  }, [
    isLoaded,
    user,
    router,
    locale,
  ]);

  /*
   * ===========================================================
   * LOADING
   * ===========================================================
   */

  if (!isLoaded) {
    return (
      <AccountLoading
        label={dictionary.loading}
      />
    );
  }

  /*
   * ===========================================================
   * AUTH GUARD
   * ===========================================================
   *
   * useEffect yönlendirmeyi gerçekleştirirken kısa süreli
   * loading görünümü gösteriyoruz.
   */

  if (!user) {
    return (
      <AccountLoading
        label={dictionary.loading}
      />
    );
  }

  /*
   * ===========================================================
   * LOGOUT
   * ===========================================================
   */

  async function handleLogout() {
    try {
      await logout();

      /*
       * Kullanıcı çıkış yaptıktan sonra
       * ana sayfaya dönsün.
       */

      router.replace(
        `/${locale}`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Çıkış yapılamadı:",
        error
      );
    }
  }

  /*
   * ===========================================================
   * USER
   * ===========================================================
   */

  const fullName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const displayName =
    fullName ||
    user.email;

  const actionLabel =
    locale === "tr"
      ? "Görüntüle"
      : locale === "en"
        ? "View"
        : "عرض";

  /*
   * ===========================================================
   * RENDER
   * ===========================================================
   */

  return (
    <main className="relative min-h-[calc(100vh-88px)] overflow-hidden bg-background px-5 py-10 text-foreground sm:px-8 sm:py-14 lg:py-16">
      {/* =====================================================
          BACKGROUND DECORATION
      ===================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-[-220px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent/[0.045] blur-3xl" />

        <div className="absolute bottom-[-260px] right-[-180px] h-[480px] w-[480px] rounded-full bg-accent/[0.025] blur-3xl" />
      </div>

      {/* =====================================================
          CONTAINER
      ===================================================== */}

      <div className="relative mx-auto w-full max-w-[1120px]">
        {/* ===================================================
            HERO
        =================================================== */}

        <section className="mx-auto flex w-full max-w-[800px] flex-col items-center justify-center text-center">
          <p className="w-full text-center text-[9px] font-semibold uppercase tracking-[0.3em] text-accent">
            {dictionary.eyebrow}
          </p>

          <h1 className="mx-auto mt-5 w-full max-w-[720px] text-center font-heading text-5xl leading-[0.95] text-foreground sm:text-6xl lg:text-7xl">
            {dictionary.title}
          </h1>

          <p className="mx-auto mt-6 w-full max-w-[650px] text-center text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
            {dictionary.description}
          </p>
        </section>

        {/* ===================================================
            USER INFORMATION
        =================================================== */}

        <section className="mx-auto mt-12 w-full max-w-[920px] border-y border-border py-8 sm:py-10">
          <div className="flex flex-col items-center justify-center text-center">
            {/* PROFILE LABEL */}

            <p className="w-full text-center text-[8px] font-semibold uppercase tracking-[0.22em] text-accent">
              {dictionary.profile}
            </p>

            {/* USER NAME */}

            <h2 className="mt-3 w-full text-center font-heading text-4xl leading-none text-foreground sm:text-5xl">
              {displayName}
            </h2>

            {/* CONTACT */}

            <div className="mt-6 flex flex-col items-center justify-center gap-3 text-center text-sm text-foreground-soft sm:flex-row sm:gap-8">
              {/* EMAIL */}

              <div className="flex items-center justify-center gap-2">
                <Mail
                  size={15}
                  strokeWidth={1.3}
                  className="text-accent"
                />

                <span>
                  {user.email}
                </span>
              </div>

              {/* PHONE */}

              <div className="flex items-center justify-center gap-2">
                <Phone
                  size={15}
                  strokeWidth={1.3}
                  className="text-accent"
                />

                <span>
                  {user.phone || "-"}
                </span>
              </div>
            </div>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoading}
              className={[
                "group mt-7 inline-flex min-h-12",
                "items-center justify-center",
                "gap-3 border px-6",

                "text-[9px] font-semibold uppercase",
                "tracking-[0.15em]",

                "transition-all duration-500",
                "ease-[cubic-bezier(0.22,1,0.36,1)]",

                isLoading
                  ? [
                      "cursor-wait",
                      "border-border",
                      "bg-surface-strong",
                      "text-muted",
                    ].join(" ")
                  : [
                      "border-border-strong",
                      "bg-transparent",
                      "text-foreground",

                      "hover:-translate-y-0.5",
                      "hover:border-danger",
                      "hover:bg-danger",
                      "hover:text-white",

                      "hover:shadow-[0_12px_32px_rgba(169,96,88,0.16)]",
                    ].join(" "),
              ].join(" ")}
            >
              {isLoading ? (
                <LoaderCircle
                  size={15}
                  strokeWidth={1.4}
                  className="animate-spin"
                />
              ) : (
                <LogOut
                  size={15}
                  strokeWidth={1.4}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                />
              )}

              <span>
                {isLoading
                  ? dictionary.loggingOut
                  : dictionary.logout}
              </span>
            </button>
          </div>
        </section>

        {/* ===================================================
            ACCOUNT NAVIGATION
        =================================================== */}

        <section className="mx-auto mt-12 w-full max-w-[920px]">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* ORDERS */}

            <AccountLink
              href={`/${locale}/account/orders`}
              icon={Package}
              number="01"
              title={dictionary.orders}
              description={
                dictionary.ordersDescription
              }
              actionLabel={actionLabel}
            />

            {/* ADDRESSES */}

            <AccountLink
              href={`/${locale}/account/addresses`}
              icon={MapPin}
              number="02"
              title={dictionary.addresses}
              description={
                dictionary.addressesDescription
              }
              actionLabel={actionLabel}
            />

            {/* FAVORITES */}

            <AccountLink
              href={`/${locale}/favorites`}
              icon={Heart}
              number="03"
              title={dictionary.favorites}
              description={
                dictionary.favoritesDescription
              }
              actionLabel={actionLabel}
            />

            {/* PROFILE */}

            <AccountLink
              href={`/${locale}/account/profile`}
              icon={UserRound}
              number="04"
              title={dictionary.profile}
              description={
                dictionary.profileDescription
              }
              actionLabel={actionLabel}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

/*
 * =============================================================
 * LOADING
 * =============================================================
 */

function AccountLoading({
  label,
}: {
  label: string;
}) {
  return (
    <main className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-background px-5">
      <div className="text-center">
        <LoaderCircle
          size={30}
          strokeWidth={1.2}
          className="mx-auto animate-spin text-accent"
        />

        <p className="mt-5 text-center text-[9px] font-semibold uppercase tracking-[0.22em] text-muted">
          {label}
        </p>
      </div>
    </main>
  );
}

/*
 * =============================================================
 * ACCOUNT LINK
 * =============================================================
 */

function AccountLink({
  href,
  icon: Icon,
  number,
  title,
  description,
  actionLabel,
}: AccountLinkProps) {
  return (
    <Link
      href={href}
      className={[
        "group relative",

        "flex min-h-[270px] flex-col",

        "items-center justify-center",

        "overflow-hidden",

        "border border-border",

        "bg-surface/25",

        "px-7 py-9",

        "text-center",

        "transition-all duration-500",

        "ease-[cubic-bezier(0.22,1,0.36,1)]",

        "hover:-translate-y-1",

        "hover:border-accent/45",

        "hover:bg-surface/65",

        "hover:shadow-[0_22px_60px_rgba(36,35,32,0.08)]",
      ].join(" ")}
    >
      {/* =====================================================
          PREMIUM HOVER GLOW
      ===================================================== */}

      <div
        aria-hidden="true"
        className={[
          "pointer-events-none",

          "absolute left-1/2 top-0",

          "h-32 w-56",

          "-translate-x-1/2",
          "-translate-y-16",

          "rounded-full",

          "bg-accent/[0.08]",

          "blur-3xl",

          "opacity-0",

          "transition-all duration-700",

          "group-hover:scale-110",

          "group-hover:opacity-100",
        ].join(" ")}
      />

      {/* =====================================================
          NUMBER
      ===================================================== */}

      <span className="absolute start-5 top-5 text-[8px] font-semibold uppercase tracking-[0.22em] text-muted transition-colors duration-500 group-hover:text-accent">
        {number}
      </span>

      {/* =====================================================
          ICON
      ===================================================== */}

      <span
        className={[
          "relative flex h-14 w-14",

          "items-center justify-center",

          "border border-accent/25",

          "bg-accent/[0.04]",

          "text-accent",

          "transition-all duration-500",

          "ease-[cubic-bezier(0.22,1,0.36,1)]",

          "group-hover:-translate-y-1",

          "group-hover:scale-[1.04]",

          "group-hover:border-accent",

          "group-hover:bg-accent",

          "group-hover:text-white",

          "group-hover:shadow-[0_12px_30px_rgba(146,115,74,0.18)]",
        ].join(" ")}
      >
        <Icon
          size={21}
          strokeWidth={1.2}
          className="transition-transform duration-500 group-hover:scale-105"
        />
      </span>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative mt-7 flex w-full flex-col items-center justify-center text-center">
        <h3 className="w-full text-center font-heading text-3xl leading-none text-foreground transition-colors duration-500 group-hover:text-accent sm:text-[38px]">
          {title}
        </h3>

        <p className="mx-auto mt-4 max-w-[330px] text-center text-xs leading-6 text-foreground-soft sm:text-sm sm:leading-7">
          {description}
        </p>
      </div>

      {/* =====================================================
          ACTION
      ===================================================== */}

      <div className="relative mt-7 flex items-center justify-center gap-2 text-center text-[8px] font-semibold uppercase tracking-[0.17em] text-muted transition-colors duration-500 group-hover:text-accent">
        <span>
          {actionLabel}
        </span>

        <ArrowRight
          size={14}
          strokeWidth={1.3}
          className="transition-transform duration-500 group-hover:translate-x-1.5 rtl:rotate-180 rtl:group-hover:-translate-x-1.5"
        />
      </div>

      {/* =====================================================
          BOTTOM PREMIUM LINE
      ===================================================== */}

      <span
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-accent transition-all duration-700 group-hover:w-[72%]"
      />
    </Link>
  );
}