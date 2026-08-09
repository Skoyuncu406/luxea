"use client";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Check,
  Clipboard,
  ClipboardCheck,
  PackageCheck,
  Search,
} from "lucide-react";

import {
  useOrders,
  type Order,
} from "@/contexts/OrderContext";

import { formatPrice } from "@/lib/format-price";
import type { Locale } from "@/lib/i18n/config";

type OrderCompleteDictionary = {
  eyebrow: string;
  title: string;
  description: string;
  trackingCode: string;
  copyCode: string;
  copied: string;
  keepCode: string;
  orderReceived: string;
  orderNumber: string;
  customer: string;
  deliveryAddress: string;
  orderSummary: string;
  total: string;
  trackOrder: string;
  continueShopping: string;
  loading: string;
  notFound: string;
};

type OrderCompleteContentProps = {
  locale: Locale;
  trackingCode: string;
  dictionary: OrderCompleteDictionary;
};

export default function OrderCompleteContent({
  locale,
  trackingCode,
  dictionary,
}: OrderCompleteContentProps) {
  const {
    findOrderByTrackingCode,
    fetchOrderByTrackingCode,
  } = useOrders();

  /*
   * Checkout'tan hemen gelindiyse sipariş
   * context içerisinde zaten bulunabilir.
   *
   * Bu durumda kullanıcıya bekleme ekranı
   * göstermeden siparişi doğrudan gösteriyoruz.
   */
  const cachedOrder =
    findOrderByTrackingCode(
      trackingCode
    );

  const [
    order,
    setOrder,
  ] = useState<Order | undefined>(
    cachedOrder
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(
    !cachedOrder
  );

  const [
    isNotFound,
    setIsNotFound,
  ] = useState(false);

  const [
    isCopied,
    setIsCopied,
  ] = useState(false);

  /*
   * ===========================================================
   * POSTGRESQL'DEN SİPARİŞİ GETİR
   * ===========================================================
   *
   * Sayfa F5 ile yenilense bile sipariş:
   *
   * trackingCode
   *      ↓
   * /api/orders/tracking/[trackingCode]
   *      ↓
   * PostgreSQL
   *
   * üzerinden tekrar bulunur.
   */

  useEffect(() => {
    let isCancelled = false;

    async function loadOrder() {
      /*
       * Context içerisinde sipariş zaten varsa
       * tekrar API isteği yapmak zorunda değiliz.
       */
      const existingOrder =
        findOrderByTrackingCode(
          trackingCode
        );

      if (existingOrder) {
        if (!isCancelled) {
          setOrder(
            existingOrder
          );

          setIsLoading(false);
          setIsNotFound(false);
        }

        return;
      }

      setIsLoading(true);
      setIsNotFound(false);

      try {
        const fetchedOrder =
          await fetchOrderByTrackingCode(
            trackingCode
          );

        if (isCancelled) {
          return;
        }

        if (!fetchedOrder) {
          setOrder(undefined);
          setIsNotFound(true);
          return;
        }

        setOrder(
          fetchedOrder
        );

        setIsNotFound(false);
      } catch (error) {
        console.error(
          "Sipariş bilgisi yüklenemedi:",
          error
        );

        if (!isCancelled) {
          setOrder(undefined);
          setIsNotFound(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      isCancelled = true;
    };
  }, [
    trackingCode,
    findOrderByTrackingCode,
    fetchOrderByTrackingCode,
  ]);

  /*
   * ===========================================================
   * TAKİP KODUNU KOPYALA
   * ===========================================================
   */

  async function copyTrackingCode() {
    if (!order) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        order.trackingCode
      );

      setIsCopied(true);

      window.setTimeout(() => {
        setIsCopied(false);
      }, 1800);
    } catch (error) {
      console.error(
        "Takip kodu kopyalanamadı:",
        error
      );

      setIsCopied(false);
    }
  }

  /*
   * ===========================================================
   * LOADING
   * ===========================================================
   */

  if (isLoading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center border-y border-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          {dictionary.loading}
        </p>
      </div>
    );
  }

  /*
   * ===========================================================
   * NOT FOUND
   * ===========================================================
   */

  if (
    isNotFound ||
    !order
  ) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center border-y border-border px-5 text-center">
        <Search
          size={32}
          strokeWidth={1.1}
          className="text-accent"
        />

        <h2 className="mt-7 font-heading text-4xl leading-none text-foreground sm:text-5xl">
          {dictionary.notFound}
        </h2>

        <Link
          href={`/${locale}/account/orders`}
          className={[
            "mt-8 inline-flex min-h-14",
            "items-center justify-center",
            "border border-foreground",
            "bg-foreground px-8",
            "text-[10px] font-semibold uppercase",
            "tracking-[0.17em] !text-[#F3F0EA]",
            "transition-all duration-300",
            "hover:border-accent hover:bg-accent",
            "hover:!text-white",
          ].join(" ")}
        >
          {dictionary.trackOrder}
        </Link>
      </div>
    );
  }

  /*
   * ===========================================================
   * VIEW DATA
   * ===========================================================
   */

  const customerName = [
    order.customer.firstName,
    order.customer.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const trackingPageUrl =
    `/${locale}/account/orders?code=${encodeURIComponent(
      order.trackingCode
    )}`;

  /*
   * ===========================================================
   * PAGE
   * ===========================================================
   */

  return (
    <div>
      {/* =======================================================
          BAŞARI ALANI
      ======================================================= */}

      <div className="flex flex-col items-center border-y border-border px-5 py-14 text-center sm:py-20">
        <span className="flex h-20 w-20 items-center justify-center rounded-full border border-success/30 bg-success/10 text-success">
          <PackageCheck
            size={34}
            strokeWidth={1.2}
          />
        </span>

        <p className="mt-8 text-[9px] font-semibold uppercase tracking-[0.3em] text-accent">
          {dictionary.eyebrow}
        </p>

        <h1 className="mt-4 max-w-4xl font-heading text-5xl leading-[0.95] text-foreground sm:text-6xl lg:text-7xl">
          {dictionary.title}
        </h1>

        <p className="mt-6 max-w-2xl text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
          {dictionary.description}
        </p>

        {/* =====================================================
            TAKİP KODU
        ===================================================== */}

        <div className="mt-10 w-full max-w-xl border border-accent/30 bg-surface/65 p-5 sm:p-7">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-muted">
            {dictionary.trackingCode}
          </p>

          <p
            dir="ltr"
            className="mt-4 break-all text-center font-heading text-3xl tracking-[0.08em] text-foreground sm:text-4xl"
          >
            {order.trackingCode}
          </p>

          <button
            type="button"
            onClick={
              copyTrackingCode
            }
            aria-label={
              isCopied
                ? dictionary.copied
                : dictionary.copyCode
            }
            className={[
              "mt-6 inline-flex min-h-11",
              "items-center justify-center gap-3",
              "border border-border px-5",
              "text-[9px] font-semibold uppercase",
              "tracking-[0.15em] text-foreground",
              "transition-all duration-300",
              "hover:border-accent hover:text-accent",
            ].join(" ")}
          >
            {isCopied ? (
              <ClipboardCheck
                size={15}
                strokeWidth={1.4}
              />
            ) : (
              <Clipboard
                size={15}
                strokeWidth={1.4}
              />
            )}

            <span>
              {isCopied
                ? dictionary.copied
                : dictionary.copyCode}
            </span>
          </button>

          <p className="mt-5 text-xs leading-6 text-foreground-soft">
            {dictionary.keepCode}
          </p>
        </div>
      </div>

      {/* =======================================================
          SİPARİŞ BİLGİLERİ
      ======================================================= */}

      <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
        <div className="min-w-0">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* =================================================
                SİPARİŞ NUMARASI
            ================================================= */}

            <section className="min-w-0 border border-border bg-surface/40 p-6">
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-accent">
                {dictionary.orderNumber}
              </p>

              <p
                dir="ltr"
                className="mt-3 break-all text-start text-xs font-semibold leading-6 text-foreground sm:text-sm"
              >
                {order.id}
              </p>

              <div className="mt-5 flex items-center gap-3 text-success">
                <Check
                  size={15}
                  strokeWidth={1.4}
                />

                <span className="text-[9px] font-semibold uppercase tracking-[0.15em]">
                  {dictionary.orderReceived}
                </span>
              </div>
            </section>

            {/* =================================================
                MÜŞTERİ
            ================================================= */}

            <section className="min-w-0 border border-border bg-surface/40 p-6">
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-accent">
                {dictionary.customer}
              </p>

              <p className="mt-3 break-words font-heading text-2xl leading-none text-foreground">
                {customerName}
              </p>

              <p className="mt-3 break-all text-xs leading-6 text-foreground-soft">
                {order.customer.email}
              </p>

              <p className="mt-1 text-xs leading-6 text-foreground-soft">
                {order.customer.phone}
              </p>
            </section>
          </div>

          {/* ===================================================
              TESLİMAT ADRESİ
          =================================================== */}

          <section className="mt-6 border border-border bg-surface/40 p-6">
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-accent">
              {dictionary.deliveryAddress}
            </p>

            <address className="mt-4 not-italic text-sm leading-7 text-foreground-soft">
              <p>
                {
                  order.shippingAddress
                    .address
                }
              </p>

              {order.shippingAddress
                .addressLineTwo && (
                <p>
                  {
                    order.shippingAddress
                      .addressLineTwo
                  }
                </p>
              )}

              <p>
                {
                  order.shippingAddress
                    .postalCode
                }{" "}
                {
                  order.shippingAddress
                    .city
                }
              </p>

              {order.shippingAddress
                .state && (
                <p>
                  {
                    order.shippingAddress
                      .state
                  }
                </p>
              )}

              <p>
                {
                  order.shippingAddress
                    .country
                }
              </p>
            </address>
          </section>
        </div>

        {/* =====================================================
            SİPARİŞ ÖZETİ
        ===================================================== */}

        <aside className="min-w-0 border border-border bg-surface/55 p-6 sm:p-7">
          <h2 className="font-heading text-4xl leading-none text-foreground">
            {dictionary.orderSummary}
          </h2>

          <div className="mt-7 space-y-5">
            {order.items.map(
              (item) => (
                <article
                  key={item.id}
                  className={[
                    "grid min-w-0",
                    "grid-cols-[72px_minmax(0,1fr)]",
                    "gap-4 border-b border-border",
                    "pb-5",
                  ].join(" ")}
                >
                  <Link
                    href={`/${locale}/products/${item.slug}`}
                    className="relative aspect-[4/5] overflow-hidden bg-background"
                  >
                    <Image
                      src={
                        item.image
                      }
                      alt={
                        item.name[
                          locale
                        ]
                      }
                      fill
                      sizes="72px"
                      className="object-cover object-center"
                    />

                    <span className="absolute end-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[8px] font-semibold text-white">
                      {
                        item.quantity
                      }
                    </span>
                  </Link>

                  <div className="min-w-0">
                    <Link
                      href={`/${locale}/products/${item.slug}`}
                      className="block break-words font-heading text-xl leading-none text-foreground transition-colors duration-300 hover:text-accent"
                    >
                      {
                        item.name[
                          locale
                        ]
                      }
                    </Link>

                    <span
                      aria-hidden="true"
                      className="mt-3 block h-3.5 w-3.5 rounded-full border border-black/15"
                      style={{
                        backgroundColor:
                          item.color,
                      }}
                    />

                    <p className="mt-3 text-[10px] font-semibold text-foreground">
                      {formatPrice(
                        item.unitPrice *
                          item.quantity,
                        item.currency,
                        locale
                      )}
                    </p>
                  </div>
                </article>
              )
            )}
          </div>

          <div className="mt-6 flex items-end justify-between gap-6 border-t border-border pt-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-foreground">
              {dictionary.total}
            </span>

            <strong className="font-heading text-3xl font-medium leading-none text-foreground">
              {formatPrice(
                order.total,
                order.currency,
                locale
              )}
            </strong>
          </div>
        </aside>
      </div>

      {/* =======================================================
          ALT AKSİYONLAR
      ======================================================= */}

      <div className="flex flex-col gap-4 border-t border-border py-10 sm:flex-row sm:justify-center">
        <Link
          href={
            trackingPageUrl
          }
          className={[
            "inline-flex min-h-14",
            "items-center justify-center",
            "border border-foreground",
            "bg-foreground px-8",
            "text-center text-[10px]",
            "font-semibold uppercase",
            "tracking-[0.17em]",
            "!text-[#F3F0EA]",
            "transition-all duration-300",
            "hover:border-accent",
            "hover:bg-accent",
            "hover:!text-white",
          ].join(" ")}
        >
          {dictionary.trackOrder}
        </Link>

        <Link
          href={`/${locale}/products`}
          className={[
            "inline-flex min-h-14",
            "items-center justify-center",
            "border border-foreground px-8",
            "text-center text-[10px]",
            "font-semibold uppercase",
            "tracking-[0.17em]",
            "text-foreground",
            "transition-all duration-300",
            "hover:bg-foreground",
            "hover:!text-[#F3F0EA]",
          ].join(" ")}
        >
          {
            dictionary.continueShopping
          }
        </Link>
      </div>
    </div>
  );
}