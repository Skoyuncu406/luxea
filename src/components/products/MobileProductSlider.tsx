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
  /*
   * =========================================================
   * REFS
   * =========================================================
   */

  const wrapperRef =
    useRef<HTMLDivElement | null>(null);

  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const resumeTimerRef =
    useRef<number | null>(null);

  /*
   * =========================================================
   * ITEMS
   * =========================================================
   */

  const items =
    Children.toArray(children);

  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  const [
    isPaused,
    setIsPaused,
  ] = useState(false);

  const [
    isInView,
    setIsInView,
  ] = useState(false);

  /*
   * Ürün sayısı değişirse geçerli index
   * aralığında kalmamızı sağlar.
   */
  const safeActiveIndex =
    Math.min(
      activeIndex,
      Math.max(
        items.length - 1,
        0
      )
    );

  /*
   * =========================================================
   * VIEWPORT OBSERVER
   * =========================================================
   *
   * Slider sayfa yüklenir yüklenmez başlamaz.
   *
   * Ürün alanının en az %25'i görünür hale
   * geldiğinde otomatik slider aktif olur.
   */

  useEffect(() => {
    const wrapper =
      wrapperRef.current;

    if (!wrapper) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          setIsInView(
            entry.isIntersecting
          );
        },
        {
          threshold: 0.25,
        }
      );

    observer.observe(wrapper);

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * =========================================================
   * BELİRLİ ÜRÜNE YATAY KAYDIR
   * =========================================================
   *
   * scrollIntoView KULLANMIYORUZ.
   *
   * Çünkü scrollIntoView sayfanın dikey
   * scroll konumunu da değiştirebilir.
   */

  function scrollToItem(
    index: number
  ) {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    const target =
      container.children[
        index
      ] as HTMLElement | undefined;

    if (!target) {
      return;
    }

    container.scrollTo({
      left: target.offsetLeft,
      behavior: "smooth",
    });

    setActiveIndex(index);
  }

  /*
   * =========================================================
   * KAYDIRMA SONRASI AKTİF ÜRÜNÜ BUL
   * =========================================================
   */

  function updateActiveIndex() {
    const container =
      containerRef.current;

    /*
     * Yalnızca mobil slider için.
     */
    if (
      !container ||
      window.innerWidth >= 640
    ) {
      return;
    }

    /*
     * Container'ın kendi yatay scroll
     * koordinatlarını kullanıyoruz.
     *
     * getBoundingClientRect kullanmak
     * zorunda değiliz.
     */

    const containerCenter =
      container.scrollLeft +
      container.clientWidth / 2;

    let closestIndex = 0;

    let closestDistance =
      Number.POSITIVE_INFINITY;

    Array.from(
      container.children
    ).forEach(
      (
        child,
        index
      ) => {
        const item =
          child as HTMLElement;

        const itemCenter =
          item.offsetLeft +
          item.offsetWidth / 2;

        const distance =
          Math.abs(
            itemCenter -
              containerCenter
          );

        if (
          distance <
          closestDistance
        ) {
          closestDistance =
            distance;

          closestIndex =
            index;
        }
      }
    );

    setActiveIndex(
      closestIndex
    );
  }

  /*
   * =========================================================
   * OTOMATİK KAYDIRMAYI DURDUR
   * =========================================================
   */

  function pauseAutoSlide() {
    setIsPaused(true);

    if (
      resumeTimerRef.current !==
      null
    ) {
      window.clearTimeout(
        resumeTimerRef.current
      );

      resumeTimerRef.current =
        null;
    }
  }

  /*
   * =========================================================
   * OTOMATİK KAYDIRMAYI DEVAM ETTİR
   * =========================================================
   */

  function resumeAutoSlide() {
    updateActiveIndex();

    if (
      resumeTimerRef.current !==
      null
    ) {
      window.clearTimeout(
        resumeTimerRef.current
      );
    }

    /*
     * Kullanıcı swipe yaptıktan sonra
     * hemen yeniden otomatik kaydırma
     * başlamasın.
     *
     * 5 saniye bekliyoruz.
     */

    resumeTimerRef.current =
      window.setTimeout(
        () => {
          setIsPaused(false);

          resumeTimerRef.current =
            null;
        },
        5000
      );
  }

  /*
   * =========================================================
   * OTOMATİK SLIDER
   * =========================================================
   */

  useEffect(() => {
    /*
     * Slider şu koşullarda çalışmaz:
     *
     * - 1 veya daha az ürün varsa
     * - kullanıcı slider ile etkileşimdeyse
     * - ürün bölümü ekranda değilse
     */

    if (
      items.length <= 1 ||
      isPaused ||
      !isInView
    ) {
      return;
    }

    /*
     * Otomatik slider sadece mobil.
     */

    const mobileQuery =
      window.matchMedia(
        "(max-width: 639px)"
      );

    /*
     * Kullanıcı reduced-motion tercih etmişse
     * otomatik hareket yapmıyoruz.
     */

    const reducedMotionQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    if (
      !mobileQuery.matches ||
      reducedMotionQuery.matches
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setActiveIndex(
            (
              currentIndex
            ) => {
              /*
               * Ürün sayısı değişmiş
               * olabileceği için index'i
               * güvenli hale getiriyoruz.
               */

              const currentSafeIndex =
                Math.min(
                  currentIndex,
                  Math.max(
                    items.length -
                      1,
                    0
                  )
                );

              /*
               * Son üründeysek başa dön.
               */

              const nextIndex =
                currentSafeIndex >=
                items.length - 1
                  ? 0
                  : currentSafeIndex +
                    1;

              const container =
                containerRef.current;

              const target =
                container
                  ?.children[
                  nextIndex
                ] as
                  | HTMLElement
                  | undefined;

              /*
               * Kritik nokta:
               *
               * scrollIntoView yerine yalnızca
               * container'ın yatay scrollLeft
               * değerini değiştiriyoruz.
               *
               * Böylece sayfanın dikey
               * scroll pozisyonu değişmez.
               */

              if (
                container &&
                target
              ) {
                container.scrollTo({
                  left:
                    target.offsetLeft,

                  behavior:
                    "smooth",
                });
              }

              return nextIndex;
            }
          );
        },
        interval
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    interval,
    isPaused,
    isInView,
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
        resumeTimerRef.current !==
        null
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

  if (
    items.length === 0
  ) {
    return null;
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div
      ref={wrapperRef}
      className={className}
    >
      {/* =====================================================
          MOBILE SLIDER / DESKTOP GRID
      ===================================================== */}

      <div
        ref={containerRef}
        onTouchStart={
          pauseAutoSlide
        }
        onTouchEnd={
          resumeAutoSlide
        }
        onTouchCancel={
          resumeAutoSlide
        }
        onPointerDown={
          pauseAutoSlide
        }
        onPointerUp={
          resumeAutoSlide
        }
        onPointerCancel={
          resumeAutoSlide
        }
        onScroll={
          updateActiveIndex
        }
        className={[
          /*
           * MOBILE
           */

          "flex",

          "w-full",

          "overflow-x-auto",

          "overflow-y-hidden",

          /*
           * Bir ürünün tam olarak
           * slider alanına oturmasını sağlar.
           */

          "snap-x",

          "snap-mandatory",

          /*
           * Programatik geçişlerde
           * yumuşak animasyon.
           */

          "scroll-smooth",

          /*
           * Mobil yatay overscroll kontrolü.
           */

          "overscroll-x-contain",

          /*
           * Parmakla yatay swipe.
           */

          "touch-pan-x",

          /*
           * Scrollbar gizleme.
           */

          "[scrollbar-width:none]",

          "[&::-webkit-scrollbar]:hidden",

          /*
           * TABLET / DESKTOP
           *
           * Burada normal grid yapısına
           * geri dönüyoruz.
           */

          "sm:grid",

          "sm:overflow-visible",

          "sm:snap-none",

          "sm:scroll-auto",

          desktopClassName,
        ].join(" ")}
      >
        {items.map(
          (
            item,
            index
          ) => (
            <div
              key={index}
              className={[
                /*
                 * MOBILE
                 */

                "w-full",

                "min-w-full",

                "shrink-0",

                "snap-start",

                "snap-always",

                /*
                 * TABLET / DESKTOP
                 */

                "sm:w-auto",

                "sm:min-w-0",

                "sm:shrink",
              ].join(" ")}
            >
              {item}
            </div>
          )
        )}
      </div>

      {/* =====================================================
          MOBILE SLIDER GÖSTERGESİ
      ===================================================== */}

      {items.length >
        1 && (
        <div
          className={[
            "mt-5",

            "flex",

            "items-center",

            "justify-center",

            "gap-2",

            "sm:hidden",
          ].join(" ")}
          aria-label="Ürün slider göstergesi"
        >
          {items.map(
            (
              _,
              index
            ) => {
              const isActive =
                safeActiveIndex ===
                index;

              return (
                <button
                  key={
                    index
                  }
                  type="button"
                  onClick={() =>
                    scrollToItem(
                      index
                    )
                  }
                  aria-label={`${index + 1}. ürüne git`}
                  aria-current={
                    isActive
                      ? "true"
                      : undefined
                  }
                  className={[
                    "h-1.5",

                    "rounded-full",

                    "transition-all",

                    "duration-300",

                    isActive
                      ? [
                          "w-6",

                          "bg-accent",
                        ].join(
                          " "
                        )
                      : [
                          "w-1.5",

                          "bg-foreground/20",

                          "hover:bg-accent/50",
                        ].join(
                          " "
                        ),
                  ].join(" ")}
                />
              );
            }
          )}
        </div>
      )}
    </div>
  );
}