"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Check,
  Circle,
  Package,
  Search,
  Truck,
  X,
} from "lucide-react";

import {
  useOrders,
  type Order,
  type OrderStatus,
} from "@/contexts/OrderContext";

import type { Locale } from "@/lib/i18n/config";

/*
 * =============================================================
 * TYPES
 * =============================================================
 */

type OrderTrackingDictionary = {
  searchTitle: string;
  searchDescription: string;

  trackingCode: string;
  trackingPlaceholder: string;
  searchButton: string;

  requiredCode: string;

  notFound: string;
  notFoundDescription: string;

  currentStatus: string;
  orderDate: string;

  customer: string;
  deliveryAddress: string;

  orderSummary: string;

  total: string;
  quantity: string;
  color: string;

  received: string;
  preparing: string;
  shipped: string;
  delivered: string;
  cancelled: string;

  receivedDescription: string;
  preparingDescription: string;
  shippedDescription: string;
  deliveredDescription: string;
  cancelledDescription: string;

  continueShopping: string;
  clearSearch: string;

  loading: string;
};

type OrderTrackingContentProps = {
  locale: Locale;

  dictionary:
    OrderTrackingDictionary;

  initialTrackingCode?: string;
};

type OrderTrackingResultProps = {
  locale: Locale;

  order: Order;

  dictionary:
    OrderTrackingDictionary;
};

/*
 * =============================================================
 * ORDER STEPS
 * =============================================================
 */

const ORDER_STEPS:
  OrderStatus[] = [
    "received",
    "preparing",
    "shipped",
    "delivered",
  ];

/*
 * =============================================================
 * MAIN COMPONENT
 * =============================================================
 */

export default function OrderTrackingContent({
  locale,
  dictionary,
  initialTrackingCode = "",
}: OrderTrackingContentProps) {
  const {
    findOrderByTrackingCode,
    fetchOrderByTrackingCode,
  } = useOrders();

  /*
   * ===========================================================
   * INITIAL CODE
   * ===========================================================
   */

  const normalizedInitialCode =
    initialTrackingCode
      .trim()
      .toUpperCase();

  /*
   * ===========================================================
   * STATE
   * ===========================================================
   */

  const [
    trackingCode,
    setTrackingCode,
  ] = useState(
    normalizedInitialCode
  );

  const [
    searchedCode,
    setSearchedCode,
  ] = useState(
    normalizedInitialCode
  );

  const [
    order,
    setOrder,
  ] = useState<
    Order | undefined
  >(() => {
    if (
      !normalizedInitialCode
    ) {
      return undefined;
    }

    return findOrderByTrackingCode(
      normalizedInitialCode
    );
  });

  const [
    error,
    setError,
  ] = useState("");

  const [
    isSearching,
    setIsSearching,
  ] = useState(false);

  const [
    hasSearched,
    setHasSearched,
  ] = useState(
    Boolean(
      normalizedInitialCode
    )
  );

  /*
   * ===========================================================
   * SEARCH ORDER
   *
   * Önce context state kontrol edilir.
   *
   * Yoksa:
   *
   * GET /api/orders/tracking/[trackingCode]
   *                    ↓
   *                Prisma
   *                    ↓
   *            Neon PostgreSQL
   * ===========================================================
   */

  const searchOrder =
    useCallback(
      async (
        code: string
      ) => {
        const normalizedCode =
          code
            .trim()
            .toUpperCase();

        /*
         * -----------------------------------------------------
         * REQUIRED
         * -----------------------------------------------------
         */

        if (
          !normalizedCode
        ) {
          setError(
            dictionary.requiredCode
          );

          setSearchedCode(
            ""
          );

          setOrder(
            undefined
          );

          setHasSearched(
            false
          );

          return;
        }

        /*
         * -----------------------------------------------------
         * SEARCH STATE
         * -----------------------------------------------------
         */

        setError("");

        setTrackingCode(
          normalizedCode
        );

        setSearchedCode(
          normalizedCode
        );

        setHasSearched(
          true
        );

        /*
         * -----------------------------------------------------
         * CONTEXT CACHE
         * -----------------------------------------------------
         *
         * Sipariş checkout'tan yeni oluşturulduysa
         * veya daha önce sorgulandıysa context içerisinde
         * bulunabilir.
         */

        const cachedOrder =
          findOrderByTrackingCode(
            normalizedCode
          );

        if (cachedOrder) {
          setOrder(
            cachedOrder
          );

          setIsSearching(
            false
          );

          return;
        }

        /*
         * -----------------------------------------------------
         * POSTGRESQL
         * -----------------------------------------------------
         */

        setOrder(
          undefined
        );

        setIsSearching(
          true
        );

        try {
          const fetchedOrder =
            await fetchOrderByTrackingCode(
              normalizedCode
            );

          setOrder(
            fetchedOrder
          );
        } catch (requestError) {
          console.error(
            "Sipariş takip sorgusu başarısız:",
            requestError
          );

          setOrder(
            undefined
          );
        } finally {
          setIsSearching(
            false
          );
        }
      },
      [
        dictionary.requiredCode,
        fetchOrderByTrackingCode,
        findOrderByTrackingCode,
      ]
    );

  /*
   * ===========================================================
   * QUERY STRING'DEN OTOMATİK ARAMA
   * ===========================================================
   *
   * Örnek:
   *
   * /tr/account/orders?code=LUX-2026-XXXXXXXXXX
   *
   * Sipariş tamamlandı sayfasındaki
   * "Siparişi Takip Et" butonundan gelindiğinde
   * müşteri tekrar arama butonuna basmaz.
   * ===========================================================
   */

  useEffect(() => {
    if (
      !normalizedInitialCode
    ) {
      return;
    }

    void searchOrder(
      normalizedInitialCode
    );
  }, [
    normalizedInitialCode,
    searchOrder,
  ]);

  /*
   * ===========================================================
   * SUBMIT
   * ===========================================================
   */

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSearching) {
      return;
    }

    void searchOrder(
      trackingCode
    );
  }

  /*
   * ===========================================================
   * INPUT CLEAR
   *
   * Sadece input değerini temizler.
   * Mevcut sonucu hemen kaldırmaz.
   * ===========================================================
   */

  function clearInput() {
    setTrackingCode("");

    setError("");
  }

  /*
   * ===========================================================
   * SEARCH CLEAR
   *
   * Sonucu ve arama kodunu tamamen temizler.
   * ===========================================================
   */

  function clearSearch() {
    setTrackingCode("");

    setSearchedCode("");

    setOrder(
      undefined
    );

    setError("");

    setHasSearched(
      false
    );

    setIsSearching(
      false
    );
  }

  /*
   * ===========================================================
   * RENDER
   * ===========================================================
   */

  return (
    <div className="mt-6 w-full sm:mt-7 lg:mt-8">
      {/* =====================================================
          ARAMA ALANI
      ===================================================== */}

      <section className="mx-auto w-full max-w-[860px] border-y border-border px-4 py-6 text-center sm:px-7 sm:py-7 lg:py-8">
        <div className="mx-auto flex w-full max-w-[620px] flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface/55 text-accent sm:h-14 sm:w-14">
            <Package
              size={22}
              strokeWidth={
                1.15
              }
            />
          </span>

          <h2 className="mt-4 w-full text-balance text-center font-heading text-[32px] leading-none text-foreground sm:text-[38px] lg:text-[42px]">
            {
              dictionary.searchTitle
            }
          </h2>

          <p className="mx-auto mt-3 w-full max-w-[540px] text-center text-xs leading-6 text-foreground-soft sm:text-sm sm:leading-7">
            {
              dictionary.searchDescription
            }
          </p>
        </div>

        {/* ===================================================
            SEARCH FORM
        =================================================== */}

        <form
          onSubmit={
            handleSubmit
          }
          className="mx-auto mt-5 flex w-full max-w-[600px] flex-col items-center"
        >
          <label className="block w-full text-center">
            <span className="mb-2 block w-full text-center text-[8px] font-semibold uppercase tracking-[0.18em] text-muted">
              {
                dictionary.trackingCode
              }
            </span>

            <div className="relative w-full">
              <Search
                size={18}
                strokeWidth={
                  1.35
                }
                className="pointer-events-none absolute start-4 top-1/2 z-10 -translate-y-1/2 text-accent"
              />

              <input
                type="text"
                value={
                  trackingCode
                }
                onChange={(
                  event
                ) => {
                  setTrackingCode(
                    event.target
                      .value
                  );

                  setError("");
                }}
                placeholder={
                  dictionary.trackingPlaceholder
                }
                aria-label={
                  dictionary.trackingCode
                }
                aria-invalid={
                  Boolean(
                    error
                  )
                }
                autoComplete="off"
                spellCheck={
                  false
                }
                dir="ltr"
                className={[
                  "block h-12 w-full min-w-0 sm:h-13",

                  "border bg-[#EEEAE3]",

                  "ps-12 pe-12",

                  "text-center text-sm uppercase",

                  "tracking-[0.08em] text-[#242320]",

                  "outline-none",

                  "transition-all duration-300",

                  "placeholder:text-center",

                  "placeholder:normal-case",

                  "placeholder:tracking-normal",

                  "placeholder:text-[#777269]",

                  error
                    ? "border-danger"
                    : "border-border hover:border-border-strong focus:border-accent",
                ].join(" ")}
              />

              {trackingCode.length >
                0 && (
                <button
                  type="button"
                  onClick={
                    clearInput
                  }
                  aria-label={
                    dictionary.clearSearch
                  }
                  className="absolute end-0 top-0 z-10 flex h-12 w-12 items-center justify-center text-muted transition-colors duration-300 hover:text-accent sm:h-13"
                >
                  <X
                    size={16}
                    strokeWidth={
                      1.4
                    }
                  />
                </button>
              )}
            </div>

            {error && (
              <p className="mt-3 w-full text-center text-[10px] font-medium text-danger">
                {error}
              </p>
            )}
          </label>

          {/* Search */}

          <button
            type="submit"
            disabled={
              isSearching
            }
            className={[
              "mt-3 inline-flex min-h-12",

              "w-full items-center justify-center",

              "gap-2.5 border border-[#242320]",

              "bg-[#242320] px-7",

              "text-center text-[9px]",

              "font-semibold uppercase",

              "tracking-[0.17em]",

              "!text-[#F3F0EA]",

              "transition-all duration-300",

              "hover:border-accent",

              "hover:bg-accent",

              "hover:!text-white",

              "disabled:cursor-wait",

              "disabled:opacity-60",
            ].join(" ")}
          >
            <Search
              size={16}
              strokeWidth={
                1.4
              }
              className={
                isSearching
                  ? "animate-pulse"
                  : ""
              }
            />

            <span>
              {isSearching
                ? dictionary.loading
                : dictionary.searchButton}
            </span>
          </button>
        </form>
      </section>

      {/* =====================================================
          ARANIYOR
      ===================================================== */}

      {isSearching && (
        <section className="mx-auto mt-10 flex min-h-[260px] w-full max-w-[900px] flex-col items-center justify-center border-y border-border px-5 text-center">
          <Search
            size={27}
            strokeWidth={
              1.1
            }
            className="animate-pulse text-accent"
          />

          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
            {
              dictionary.loading
            }
          </p>
        </section>
      )}

      {/* =====================================================
          SİPARİŞ BULUNAMADI
      ===================================================== */}

      {!isSearching &&
        hasSearched &&
        searchedCode &&
        !order && (
          <section className="mx-auto mt-10 flex min-h-[340px] w-full max-w-[900px] flex-col items-center justify-center border-y border-border px-5 py-12 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface/50 text-accent">
              <Search
                size={27}
                strokeWidth={
                  1.1
                }
              />
            </span>

            <h2 className="mt-7 w-full text-center font-heading text-4xl leading-none text-foreground sm:text-5xl">
              {
                dictionary.notFound
              }
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-7 text-foreground-soft sm:text-base">
              {
                dictionary.notFoundDescription
              }
            </p>

            <button
              type="button"
              onClick={
                clearSearch
              }
              className={[
                "mt-8 inline-flex min-h-12",

                "items-center justify-center",

                "border border-foreground px-7",

                "text-center text-[9px]",

                "font-semibold uppercase",

                "tracking-[0.16em]",

                "text-foreground",

                "transition-all duration-300",

                "hover:bg-foreground",

                "hover:!text-[#F3F0EA]",
              ].join(" ")}
            >
              {
                dictionary.clearSearch
              }
            </button>
          </section>
        )}

      {/* =====================================================
          SİPARİŞ SONUCU
      ===================================================== */}

      {!isSearching &&
        order && (
          <OrderTrackingResult
            locale={
              locale
            }
            order={
              order
            }
            dictionary={
              dictionary
            }
          />
        )}
    </div>
  );
}

/*
 * =============================================================
 * ORDER TRACKING RESULT
 * =============================================================
 */

function OrderTrackingResult({
  locale,
  order,
  dictionary,
}: OrderTrackingResultProps) {
  const isCancelled =
    order.status ===
    "cancelled";

  const currentStepIndex =
    ORDER_STEPS.indexOf(
      order.status
    );

  const statusLabel =
    getStatusLabel(
      order.status,
      dictionary
    );

  const formattedDate =
    new Intl.DateTimeFormat(
      locale,
      {
        dateStyle:
          "long",

        timeStyle:
          "short",
      }
    ).format(
      new Date(
        order.createdAt
      )
    );

  const customerName = [
    order.customer.firstName,
    order.customer.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mt-12 w-full">
      {/* =====================================================
          SİPARİŞ ÜST BİLGİSİ
      ===================================================== */}

      <section className="w-full border-y border-border py-10 text-center">
        <div className="grid w-full gap-8 md:grid-cols-3">
          {/* Tracking */}

          <div className="flex min-w-0 flex-col items-center text-center">
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-accent">
              {
                dictionary.trackingCode
              }
            </p>

            <p
              dir="ltr"
              className="mt-3 w-full break-all text-center font-heading text-2xl tracking-[0.06em] text-foreground"
            >
              {
                order.trackingCode
              }
            </p>
          </div>

          {/* Date */}

          <div className="flex min-w-0 flex-col items-center text-center">
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-accent">
              {
                dictionary.orderDate
              }
            </p>

            <p className="mt-3 text-center text-sm leading-6 text-foreground-soft">
              {
                formattedDate
              }
            </p>
          </div>

          {/* Status */}

          <div className="flex min-w-0 flex-col items-center text-center">
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-accent">
              {
                dictionary.currentStatus
              }
            </p>

            <p
              className={[
                "mt-3 inline-flex min-h-9",

                "items-center justify-center",

                "border px-4 text-center",

                "text-[9px] font-semibold uppercase",

                "tracking-[0.15em]",

                isCancelled
                  ? "border-danger/30 bg-danger/10 text-danger"
                  : "border-success/30 bg-success/10 text-success",
              ].join(" ")}
            >
              {
                statusLabel
              }
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          SİPARİŞ AŞAMALARI
      ===================================================== */}

      <section className="w-full py-12">
        {isCancelled ? (
          <div className="mx-auto flex max-w-[760px] flex-col items-center justify-center gap-5 border border-danger/25 bg-danger/10 p-6 text-center text-danger">
            <X
              size={23}
              strokeWidth={
                1.3
              }
            />

            <div className="text-center">
              <h2 className="font-heading text-3xl leading-none">
                {
                  dictionary.cancelled
                }
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-7">
                {
                  dictionary.cancelledDescription
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto grid w-full max-w-[1100px] gap-0 lg:grid-cols-4">
            {ORDER_STEPS.map(
              (
                status,
                index
              ) => {
                const isCompleted =
                  index <=
                  currentStepIndex;

                const isCurrent =
                  index ===
                  currentStepIndex;

                const historyEntry =
                  order.statusHistory.find(
                    (
                      entry
                    ) =>
                      entry.status ===
                      status
                  );

                return (
                  <div
                    key={
                      status
                    }
                    className="relative flex flex-col items-center pb-10 text-center lg:block lg:pb-0"
                  >
                    {index <
                      ORDER_STEPS.length -
                        1 && (
                      <>
                        {/* Mobile vertical line */}

                        <span
                          className={[
                            "absolute start-1/2 top-9",

                            "h-[calc(100%-18px)] w-px",

                            "-translate-x-1/2 lg:hidden",

                            isCompleted
                              ? "bg-accent"
                              : "bg-border-strong",
                          ].join(" ")}
                        />

                        {/* Desktop horizontal line */}

                        <span
                          className={[
                            "absolute start-1/2 top-[17px]",

                            "hidden h-px w-full lg:block",

                            index <
                            currentStepIndex
                              ? "bg-accent"
                              : "bg-border-strong",
                          ].join(" ")}
                        />
                      </>
                    )}

                    {/* Circle */}

                    <div className="relative z-10 flex justify-center">
                      <span
                        className={[
                          "flex h-9 w-9 items-center",

                          "justify-center rounded-full border",

                          isCompleted
                            ? "border-accent bg-accent text-white"
                            : "border-border-strong bg-background text-muted",

                          isCurrent
                            ? "shadow-[0_0_0_6px_rgba(146,115,74,0.12)]"
                            : "",
                        ].join(" ")}
                      >
                        {isCompleted ? (
                          status ===
                          "shipped" ? (
                            <Truck
                              size={
                                15
                              }
                              strokeWidth={
                                1.5
                              }
                            />
                          ) : (
                            <Check
                              size={
                                15
                              }
                              strokeWidth={
                                1.6
                              }
                            />
                          )
                        ) : (
                          <Circle
                            size={
                              8
                            }
                            fill="currentColor"
                            strokeWidth={
                              0
                            }
                          />
                        )}
                      </span>
                    </div>

                    {/* Text */}

                    <div className="relative z-10 mx-auto max-w-[230px] bg-background px-3 pt-6 text-center">
                      <h3
                        className={[
                          "text-center font-heading",

                          "text-2xl leading-none",

                          isCompleted
                            ? "text-foreground"
                            : "text-muted",
                        ].join(" ")}
                      >
                        {getStatusLabel(
                          status,
                          dictionary
                        )}
                      </h3>

                      <p className="mt-3 text-center text-xs leading-6 text-foreground-soft">
                        {getStatusDescription(
                          status,
                          dictionary
                        )}
                      </p>

                      {historyEntry && (
                        <p className="mt-3 text-center text-[8px] font-semibold uppercase tracking-[0.12em] text-accent">
                          {new Intl.DateTimeFormat(
                            locale,
                            {
                              dateStyle:
                                "medium",

                              timeStyle:
                                "short",
                            }
                          ).format(
                            new Date(
                              historyEntry.date
                            )
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          SİPARİŞ DETAYLARI
      ===================================================== */}

      <div className="grid w-full gap-10 border-t border-border pt-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
        <div className="min-w-0">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* =================================================
                MÜŞTERİ
            ================================================= */}

            <section className="flex flex-col items-center border border-border bg-surface/40 p-6 text-center">
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-accent">
                {
                  dictionary.customer
                }
              </p>

              <p className="mt-3 break-words text-center font-heading text-2xl leading-none text-foreground">
                {
                  customerName
                }
              </p>

              <p className="mt-3 break-all text-center text-xs leading-6 text-foreground-soft">
                {
                  order.customer
                    .email
                }
              </p>

              <p className="mt-1 text-center text-xs leading-6 text-foreground-soft">
                {
                  order.customer
                    .phone
                }
              </p>
            </section>

            {/* =================================================
                TESLİMAT ADRESİ
            ================================================= */}

            <section className="flex flex-col items-center border border-border bg-surface/40 p-6 text-center">
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-accent">
                {
                  dictionary.deliveryAddress
                }
              </p>

              <address className="mt-3 text-center text-xs leading-6 text-foreground-soft not-italic">
                <p>
                  {
                    order
                      .shippingAddress
                      .address
                  }
                </p>

                {order.shippingAddress
                  .addressLineTwo && (
                  <p>
                    {
                      order
                        .shippingAddress
                        .addressLineTwo
                    }
                  </p>
                )}

                <p>
                  {
                    order
                      .shippingAddress
                      .postalCode
                  }{" "}
                  {
                    order
                      .shippingAddress
                      .city
                  }
                </p>

                {order.shippingAddress
                  .state && (
                  <p>
                    {
                      order
                        .shippingAddress
                        .state
                    }
                  </p>
                )}

                <p>
                  {
                    order
                      .shippingAddress
                      .country
                  }
                </p>
              </address>
            </section>
          </div>
        </div>

        {/* =====================================================
            SİPARİŞ ÖZETİ
        ===================================================== */}

        <aside className="min-w-0 border border-border bg-surface/55 p-6 text-center sm:p-7">
          <h2 className="text-center font-heading text-4xl leading-none text-foreground">
            {
              dictionary.orderSummary
            }
          </h2>

          <div className="mt-7 space-y-5">
            {order.items.map(
              (item) => (
                <article
                  key={
                    item.id
                  }
                  className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] items-center gap-4 border-b border-border pb-5"
                >
                  {/* Image */}

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

                    <span className="absolute end-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[8px] text-white">
                      {
                        item.quantity
                      }
                    </span>
                  </Link>

                  {/* Detail */}

                  <div className="flex min-w-0 flex-col items-center text-center">
                    <Link
                      href={`/${locale}/products/${item.slug}`}
                      className="block break-words text-center font-heading text-xl leading-none text-foreground transition-colors duration-300 hover:text-accent"
                    >
                      {
                        item.name[
                          locale
                        ]
                      }
                    </Link>

                    {/* Color */}

                    <div className="mt-3 flex items-center justify-center gap-3">
                      <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-muted">
                        {
                          dictionary.color
                        }
                      </span>

                      <span
                        aria-hidden="true"
                        className="h-3.5 w-3.5 rounded-full border border-black/15"
                        style={{
                          backgroundColor:
                            item.color,
                        }}
                      />
                    </div>

                    {/* Quantity */}

                    <p className="mt-3 text-center text-[8px] font-semibold uppercase tracking-[0.14em] text-muted">
                      {
                        dictionary.quantity
                      }
                      :{" "}
                      {
                        item.quantity
                      }
                    </p>


                  </div>
                </article>
              )
            )}
          </div>

          <div className="mt-6 border-t border-border pt-6 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-accent">
              {dictionary.orderSummary}
            </p>

            <p className="mx-auto mt-3 max-w-sm text-xs leading-6 text-foreground-soft">
              {locale === "tr"
                ? "Fiyat ve sipariş detayları firma tarafından sizinle ayrıca paylaşılacaktır."
                : locale === "ar"
                  ? "ستتم مشاركة السعر وتفاصيل الطلب معك بشكل منفصل من قبل الشركة."
                  : "Pricing and order details will be shared with you separately by the company."}
            </p>
          </div>
        </aside>
      </div>

      {/* =====================================================
          CONTINUE SHOPPING
      ===================================================== */}

      <div className="flex w-full justify-center border-t border-border py-10">
        <Link
          href={`/${locale}/products`}
          className={[
            "inline-flex min-h-14",

            "items-center justify-center",

            "border border-foreground px-8",

            "text-center text-[9px]",

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

/*
 * =============================================================
 * STATUS LABEL
 * =============================================================
 */

function getStatusLabel(
  status: OrderStatus,
  dictionary:
    OrderTrackingDictionary
) {
  const labels: Record<
    OrderStatus,
    string
  > = {
    received:
      dictionary.received,

    preparing:
      dictionary.preparing,

    shipped:
      dictionary.shipped,

    delivered:
      dictionary.delivered,

    cancelled:
      dictionary.cancelled,
  };

  return labels[
    status
  ];
}

/*
 * =============================================================
 * STATUS DESCRIPTION
 * =============================================================
 */

function getStatusDescription(
  status: OrderStatus,
  dictionary:
    OrderTrackingDictionary
) {
  const descriptions: Record<
    OrderStatus,
    string
  > = {
    received:
      dictionary.receivedDescription,

    preparing:
      dictionary.preparingDescription,

    shipped:
      dictionary.shippedDescription,

    delivered:
      dictionary.deliveredDescription,

    cancelled:
      dictionary.cancelledDescription,
  };

  return descriptions[
    status
  ];
}