"use client";

import { useEffect, useState } from "react";

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const leaveTimer = window.setTimeout(() => {
      setIsLeaving(true);
    }, 1700);

    const removeTimer = window.setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = "";
    }, 2300);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <div
      role="status"
      aria-label="Sayfa yükleniyor"
      className={[
        "fixed inset-0 z-[9999] flex min-h-[100dvh] items-center justify-center overflow-hidden",
        "bg-[#E5E0D7]",
        "transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]",
        isLeaving
          ? "pointer-events-none -translate-y-full opacity-0"
          : "translate-y-0 opacity-100",
      ].join(" ")}
    >
      {/* Arka plan dokusu */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(238,234,227,0.95)_0%,rgba(229,224,215,0.92)_42%,rgba(203,196,184,0.72)_100%)]"
      />

      {/* Dekoratif ışıklar */}
      <div
        aria-hidden="true"
        className="absolute -end-24 -top-24 h-72 w-72 rounded-full bg-[#92734A]/10 blur-[100px] sm:h-96 sm:w-96"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-28 -start-24 h-72 w-72 rounded-full bg-[#AAA9A5]/20 blur-[100px] sm:h-96 sm:w-96"
      />

      {/* Üst ve alt çizgiler */}
      <div
        aria-hidden="true"
        className="absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-[#242320]/20 to-transparent sm:inset-x-12 sm:top-10"
      />

      <div
        aria-hidden="true"
        className="absolute inset-x-6 bottom-6 h-px bg-gradient-to-r from-transparent via-[#242320]/20 to-transparent sm:inset-x-12 sm:bottom-10"
      />

      {/* Loader içeriği */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6 text-center">
        <div className="overflow-hidden">
          <p className="page-loader-brand font-heading text-[42px] font-medium uppercase leading-none tracking-[0.22em] text-[#242320] sm:text-[56px] sm:tracking-[0.28em]">
            Luxea
          </p>
        </div>

        <p className="page-loader-subtitle mt-4 text-[8px] font-medium uppercase tracking-[0.42em] text-[#92734A] sm:text-[9px]">
          Premium Accessories
        </p>

        {/* Yükleme çizgisi */}
        <div className="mt-9 h-px w-44 overflow-hidden bg-[#242320]/15 sm:mt-11 sm:w-52">
          <div className="page-loader-progress h-full bg-[#92734A]" />
        </div>

        <p className="page-loader-year mt-5 text-[8px] uppercase tracking-[0.32em] text-[#777269]">
          Est. 2026
        </p>
      </div>

      <span className="sr-only">Yükleniyor...</span>
    </div>
  );
}