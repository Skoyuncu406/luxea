"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { useFavorites } from "@/contexts/FavoritesContext";
import type { Locale } from "@/lib/i18n/config";

type FavoritesNavLinkProps = {
  locale: Locale;
  label: string;
  variant: "mobile" | "desktop";
  onNavigate?: () => void;
};

export default function FavoritesNavLink({
  locale,
  label,
  variant,
  onNavigate,
}: FavoritesNavLinkProps) {
  const {
    favoriteCount,
    isLoaded,
  } = useFavorites();

  const isMobile = variant === "mobile";

  return (
    <Link
      href={`/${locale}/favorites`}
      aria-label={label}
      title={label}
      onClick={onNavigate}
      className={[
        "relative inline-flex shrink-0 items-center justify-center",
        "text-foreground transition-colors duration-300",
        "hover:text-accent",
        isMobile
          ? "h-8 w-8"
          : "h-10 w-10",
      ].join(" ")}
    >
      <Heart
        size={isMobile ? 17 : 18}
        strokeWidth={isMobile ? 1.45 : 1.5}
      />

      {isLoaded && favoriteCount > 0 && (
        <span
          className={[
            "absolute flex items-center justify-center rounded-full",
            "bg-accent font-semibold leading-none text-white",
            isMobile
              ? "-end-0.5 -top-0.5 h-3.5 min-w-3.5 px-0.5 text-[7px]"
              : "end-0 top-0 h-4 min-w-4 px-1 text-[8px]",
          ].join(" ")}
        >
          {favoriteCount > 99
            ? "99+"
            : favoriteCount}
        </span>
      )}
    </Link>
  );
}