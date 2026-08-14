"use client";

import {
  Children,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type MobileProductSliderProps = {
  children: ReactNode;
  className?: string;
  desktopClassName?: string;
  interval?: number;
};

export default function MobileProductSlider({
  children,
  className = "",
  desktopClassName = "",
  interval = 4000,
}: MobileProductSliderProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const resumeTimerRef =
    useRef<number | null>(null);

  const items = Children.toArray(children);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [isPaused, setIsPaused] =
    useState(false);

  /*
   * Ürün sayısı azalırsa mevcut index'in
   * geçerli aralıkta kalmasını sağlar.
   *
   * Bunun için useEffect + setState kullanmıyoruz.
   */
  const safeActiveIndex = Math.min(
    activeIndex,
    Math.max(items.length - 1, 0)
  );

  /*
   * =========================================================
   * BELİRLİ ÜRÜNE KAYDIR
   * =========================================================
   */

  function scrollToItem(index: number) {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const target = container.children[
      index
    ] as HTMLElement | undefined;

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });

    setActiveIndex(index);
  }

  /*
   * =========================================================
   * KAYDIRMA SONRASI AKTİF ÜRÜNÜ BUL
   * =========================================================
   */

  function updateActiveIndex() {
    const container = containerRef.current;

    if (
      !container ||
      window.innerWidth >= 640
    ) {
      return;
    }

    const containerRect =
      container.getBoundingClientRect();

    const containerCenter =
      containerRect.left +
      containerRect.width / 2;

    let closestIndex = 0;

    let closestDistance =
      Number.POSITIVE_INFINITY;

    Array.from(
      container.children
    ).forEach((child, index) => {
      const rect = (
        child as HTMLElement
      ).getBoundingClientRect();

      const childCenter =
        rect.left + rect.width / 2;

      const distance = Math.abs(
        childCenter - containerCenter
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }

  /*
   * =========================================================
   * OTOMATİK KAYDIRMAYI DURDUR
   * =========================================================
   */

  function pauseAutoSlide() {
    setIsPaused(true);

    if (resumeTimerRef.current !== null) {
      window.clearTimeout(
        resumeTimerRef.current
      );

      resumeTimerRef.current = null;
    }
  }

  /*
   * =========================================================
   * OTOMATİK KAYDIRMAYI DEVAM ETTİR
   * =========================================================
   */

  function resumeAutoSlide() {
    updateActiveIndex();

    if (resumeTimerRef.current !== null) {
      window.clearTimeout(
        resumeTimerRef.current
      );
    }

    /*
     * Kullanıcı swipe yaptıktan sonra
     * 5 saniye bekle.
     */
    resumeTimerRef.current =
      window.setTimeout(() => {
        setIsPaused(false);
        resumeTimerRef.current = null;
      }, 5000);
  }

  /*
   * =========================================================
   * OTOMATİK SLIDER
   * =========================================================
   */

  useEffect(() => {
    if (
      items.length <= 1 ||
      isPaused
    ) {
      return;
    }

    const mobileQuery =
      window.matchMedia(
        "(max-width: 639px)"
      );

    const reducedMotionQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    /*
     * Yalnızca mobilde çalışır.
     *
     * Kullanıcı reduced-motion tercih etmişse
     * otomatik hareket yapılmaz.
     */
    if (
      !mobileQuery.matches ||
      reducedMotionQuery.matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => {
        /*
         * Ürün sayısı değişmiş olabileceği için
         * önce index'i güvenli hale getiriyoruz.
         */
        const currentSafeIndex = Math.min(
          currentIndex,
          Math.max(items.length - 1, 0)
        );

        const nextIndex =
          currentSafeIndex >=
          items.length - 1
            ? 0
            : currentSafeIndex + 1;

        const container =
          containerRef.current;

        const target =
          container?.children[
            nextIndex
          ] as HTMLElement | undefined;

        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start",
          });
        }

        return nextIndex;
      });
    }, interval);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    interval,
    isPaused,
    items.length,
  ]);

  /*
   * =========================================================
   * COMPONENT UNMOUNT CLEANUP
   * =========================================================
   */

  useEffect(() => {
    return () => {
      if (
        resumeTimerRef.current !== null
      ) {
        window.clearTimeout(
          resumeTimerRef.current
        );
      }
    };
  }, []);

  /*
   * =========================================================
   * ÜRÜN YOKSA
   * =========================================================
   */

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {/* =====================================================
          MOBILE SLIDER / DESKTOP GRID
      ===================================================== */}

      <div
        ref={containerRef}
        onTouchStart={pauseAutoSlide}
        onTouchEnd={resumeAutoSlide}
        onTouchCancel={resumeAutoSlide}
        onPointerDown={pauseAutoSlide}
        onPointerUp={resumeAutoSlide}
        onPointerCancel={resumeAutoSlide}
        onScroll={updateActiveIndex}
        className={[
          /*
           * MOBILE
           */
          "flex w-full overflow-x-auto overflow-y-hidden",
          "snap-x snap-mandatory scroll-smooth",
          "overscroll-x-contain touch-pan-x",
          "[scrollbar-width:none]",
          "[&::-webkit-scrollbar]:hidden",

          /*
           * TABLET / DESKTOP
           */
          "sm:grid",
          "sm:overflow-visible",
          "sm:snap-none",
          "sm:scroll-auto",

          desktopClassName,
        ].join(" ")}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="w-full min-w-full shrink-0 snap-start snap-always sm:w-auto sm:min-w-0 sm:shrink"
          >
            {item}
          </div>
        ))}
      </div>

      {/* =====================================================
          MOBILE SLIDER GÖSTERGESİ
      ===================================================== */}

      {items.length > 1 && (
        <div
          className="mt-5 flex items-center justify-center gap-2 sm:hidden"
          aria-label="Ürün slider göstergesi"
        >
          {items.map((_, index) => {
            const isActive =
              safeActiveIndex === index;

            return (
              <button
                key={index}
                type="button"
                onClick={() =>
                  scrollToItem(index)
                }
                aria-label={`${index + 1}. ürüne git`}
                aria-current={
                  isActive
                    ? "true"
                    : undefined
                }
                className={[
                  "h-1.5 rounded-full",
                  "transition-all duration-300",
                  isActive
                    ? "w-6 bg-accent"
                    : "w-1.5 bg-foreground/20",
                ].join(" ")}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}