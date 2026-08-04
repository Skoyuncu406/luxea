"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function PageLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const leaveTimer = window.setTimeout(() => {
      setIsLeaving(true);
    }, 2100);

    const removeTimer = window.setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = previousOverflow;
    }, 2850);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);

      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Sayfa yükleniyor"
      className={[
        "fixed inset-0 z-[9999]",
        "flex min-h-[100dvh] items-center justify-center",
        "overflow-hidden bg-background",
        "transition-all duration-[750ms]",
        "ease-[cubic-bezier(0.76,0,0.24,1)]",
        isLeaving
          ? "pointer-events-none scale-[1.015] opacity-0"
          : "scale-100 opacity-100",
      ].join(" ")}
    >
      {/* Merkezde yumuşak altın ışık */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.07] blur-[120px] sm:h-[560px] sm:w-[560px] lg:h-[680px] lg:w-[680px]"
      />

      {/* Sağ üst gümüş ışık */}
      <div
        aria-hidden="true"
        className="absolute end-[5%] top-[10%] h-[260px] w-[260px] rounded-full bg-silver/15 blur-[110px] sm:h-[380px] sm:w-[380px]"
      />

      {/* Sol alt altın ışık */}
      <div
        aria-hidden="true"
        className="absolute bottom-[5%] start-[8%] h-[240px] w-[240px] rounded-full bg-accent/[0.04] blur-[100px] sm:h-[340px] sm:w-[340px]"
      />

      {/* İnce dış çerçeve */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 border border-foreground/[0.07] sm:inset-7 lg:inset-10"
      />

      {/* Üst dekoratif çizgi */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center sm:top-7 lg:top-10"
      >
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent/50 sm:w-16" />

        <span className="mx-3 h-1.5 w-1.5 rotate-45 border border-accent/60" />

        <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent/50 sm:w-16" />
      </div>

      {/* Ana içerik */}
      <div className="relative z-10 flex w-full flex-col items-center px-6 text-center">
        {/* Tek logo */}
<div className="page-loader-logo relative h-[330px] w-[330px] overflow-hidden min-[390px]:h-[360px] min-[390px]:w-[360px] sm:h-[420px] sm:w-[420px] lg:h-[470px] lg:w-[470px] xl:h-[520px] xl:w-[520px]">
<Image
  src="/luxea-1.jpg"
  alt="LUXEA"
  fill
  priority
  sizes="(max-width: 389px) 330px, (max-width: 639px) 360px, (max-width: 1023px) 420px, (max-width: 1279px) 470px, 520px"
  className="object-contain object-center"
/>
        </div>

        {/* Dekoratif ayırıcı */}
        <div className="page-loader-divider mt-4 flex w-full max-w-[280px] items-center sm:mt-6">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/40 to-accent/60" />

          <span className="mx-4 h-1.5 w-1.5 rotate-45 bg-accent/70" />

          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-accent/40 to-accent/60" />
        </div>

        {/* İlerleme çizgisi */}
        <div className="mt-6 h-px w-full max-w-[210px] overflow-hidden bg-foreground/10">
          <div className="page-loader-progress h-full w-full bg-gradient-to-r from-transparent via-accent to-transparent" />
        </div>

        {/* Alt metin */}
        <p className="page-loader-caption mt-5 text-[8px] font-semibold uppercase tracking-[0.34em] text-accent sm:text-[9px]">
          Luxury in every detail
        </p>
      </div>

      {/* Alt marka bilgisi */}
      <div className="page-loader-footer absolute inset-x-0 bottom-9 flex justify-center px-6 sm:bottom-12 lg:bottom-14">
        <p className="text-[7px] font-medium uppercase tracking-[0.3em] text-foreground/35 sm:text-[8px]">
          LUXEA · EST. 2026
        </p>
      </div>

      <span className="sr-only">Yükleniyor...</span>
    </div>
  );
}