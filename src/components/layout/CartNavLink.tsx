"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { useCart } from "@/contexts/CartContext";
import type { Locale } from "@/lib/i18n/config";

type CartNavLinkProps = {
  locale: Locale;
  label: string;
  variant: "mobile" | "desktop";
  onNavigate?: () => void;
};

export default function CartNavLink({
  locale,
  label,
  variant,
  onNavigate,
}: CartNavLinkProps) {
  const { cartCount, isLoaded } = useCart();

  const isMobile = variant === "mobile";

  return (
    <Link
      href={`/${locale}/cart`}
      aria-label={label}
      title={label}
      onClick={onNavigate}
      className={[
        "relative inline-flex shrink-0 items-center justify-center",
        "text-foreground transition-colors duration-300",
        "hover:text-accent",
        isMobile ? "h-8 w-8" : "h-10 w-10",
      ].join(" ")}
    >
      <ShoppingBag
        size={isMobile ? 17 : 18}
        strokeWidth={isMobile ? 1.45 : 1.5}
      />

      {isLoaded && cartCount > 0 && (
        <span
          className={[
            "absolute flex items-center justify-center rounded-full",
            "bg-accent font-semibold leading-none text-white",
            isMobile
              ? "-end-0.5 -top-0.5 h-3.5 min-w-3.5 px-0.5 text-[7px]"
              : "end-0 top-0 h-4 min-w-4 px-1 text-[8px]",
          ].join(" ")}
        >
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </Link>
  );
}