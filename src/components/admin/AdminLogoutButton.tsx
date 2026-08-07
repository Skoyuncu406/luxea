"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircle,
  LogOut,
} from "lucide-react";

import type { Locale } from "@/lib/i18n/config";

type AdminLogoutButtonProps = {
  locale: Locale;
  label?: string;
  loadingLabel?: string;
};

export default function AdminLogoutButton({
  locale,
  label = "Çıkış Yap",
  loadingLabel = "Çıkış Yapılıyor",
}: AdminLogoutButtonProps) {
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await fetch(
        "/api/admin/logout",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Çıkış işlemi başarısız oldu."
        );
      }

      router.replace(
        `/${locale}/admin/login`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Admin çıkış işlemi başarısız:",
        error
      );

      setIsLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={[
        "inline-flex min-h-12 items-center justify-center gap-3",
        "border px-5 text-[9px] font-semibold uppercase",
        "tracking-[0.16em] transition-all duration-300",
        isLoggingOut
          ? "cursor-wait border-border bg-surface-strong text-muted"
          : "border-border bg-surface/60 text-foreground hover:border-danger hover:bg-danger/10 hover:text-danger",
      ].join(" ")}
    >
      {isLoggingOut ? (
        <LoaderCircle
          size={15}
          strokeWidth={1.4}
          className="animate-spin"
        />
      ) : (
        <LogOut
          size={15}
          strokeWidth={1.4}
        />
      )}

      <span>
        {isLoggingOut
          ? loadingLabel
          : label}
      </span>
    </button>
  );
}