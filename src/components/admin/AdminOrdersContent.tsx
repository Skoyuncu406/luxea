"use client";

import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import Image from "next/image";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  Package,
  Search,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";

import {
  useOrders,
  type Order,
  type OrderStatus,
} from "@/contexts/OrderContext";

import { useProducts } from "@/contexts/ProductContext";

import { formatPrice } from "@/lib/format-price";
import type { Locale } from "@/lib/i18n/config";

type AdminOrdersDictionary = {
  searchPlaceholder: string;
  allStatuses: string;
  ordersFound: string;

  noOrders: string;
  noOrdersDescription: string;

  clearFilters: string;

  totalOrders: string;
  pendingOrders: string;

  trackingCode: string;
  customer: string;
  orderDate: string;
  total: string;
  status: string;

  details: string;
  hideDetails: string;

  email: string;
  phone: string;
  deliveryAddress: string;

  orderItems: string;
  quantity: string;
  color: string;
  unitPrice: string;

  subtotal: string;
  shipping: string;
  orderTotal: string;

  statusHistory: string;
  updateStatus: string;

  received: string;
  paymentConfirmed: string;
  preparing: string;
  shipped: string;
  delivered: string;
  cancelled: string;

  loading: string;
};

type AdminOrdersContentProps = {
  locale: Locale;
  dictionary: AdminOrdersDictionary;
};

const STATUS_OPTIONS: OrderStatus[] = [
  "received",
  "payment-confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrdersContent({
  locale,
  dictionary,
}: AdminOrdersContentProps) {
  /*
   * =========================================================
   * ORDER CONTEXT
   * =========================================================
   */
  const {
    orders,
    isLoaded: ordersLoaded,
    updateOrderStatus,
  } = useOrders();

  /*
   * =========================================================
   * PRODUCT / STOCK CONTEXT
   * =========================================================
   */
  const {
    isLoaded: productsLoaded,
    decreaseProductStocks,
    restoreProductStocks,
  } = useProducts();

  const isLoaded =
    ordersLoaded &&
    productsLoaded;

  /*
   * =========================================================
   * UI STATE
   * =========================================================
   */
  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState<
    OrderStatus | "all"
  >("all");

  const [
    expandedOrderId,
    setExpandedOrderId,
  ] = useState<string | null>(
    null
  );

  /*
   * =========================================================
   * SİPARİŞ İSTATİSTİKLERİ
   * =========================================================
   */
  const orderStats = useMemo(() => {
    const count = (
      status: OrderStatus
    ) =>
      orders.filter(
        (order) =>
          order.status === status
      ).length;

    return {
      total:
        orders.length,

      pending:
        count("received") +
        count(
          "payment-confirmed"
        ),

      preparing:
        count("preparing"),

      shipped:
        count("shipped"),

      delivered:
        count("delivered"),

      cancelled:
        count("cancelled"),
    };
  }, [orders]);

  /*
   * =========================================================
   * ARAMA + FİLTRE + SIRALAMA
   * =========================================================
   */
  const filteredOrders =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLocaleLowerCase(
            locale
          );

      return [...orders]
        .filter((order) => {
          const customerName = [
            order.customer
              .firstName,

            order.customer
              .lastName,
          ]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase(
              locale
            );

          const customerEmail =
            order.customer.email
              .trim()
              .toLocaleLowerCase();

          const customerPhone =
            order.customer.phone
              .trim()
              .toLocaleLowerCase();

          const trackingCode =
            order.trackingCode
              .trim()
              .toLocaleLowerCase();

          const matchesSearch =
            normalizedSearch.length ===
              0 ||
            trackingCode.includes(
              normalizedSearch
            ) ||
            customerEmail.includes(
              normalizedSearch
            ) ||
            customerPhone.includes(
              normalizedSearch
            ) ||
            customerName.includes(
              normalizedSearch
            );

          const matchesStatus =
            selectedStatus ===
              "all" ||
            order.status ===
              selectedStatus;

          return (
            matchesSearch &&
            matchesStatus
          );
        })
        .sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        );
    }, [
      locale,
      orders,
      searchQuery,
      selectedStatus,
    ]);

  /*
   * =========================================================
   * FİLTRELERİ TEMİZLE
   * =========================================================
   */
  function clearFilters() {
    setSearchQuery("");
    setSelectedStatus("all");
  }

  /*
   * =========================================================
   * SİPARİŞ DETAY AÇ / KAPAT
   * =========================================================
   */
  function toggleOrder(
    orderId: string
  ) {
    setExpandedOrderId(
      (current) =>
        current === orderId
          ? null
          : orderId
    );
  }

  /*
   * =========================================================
   * SİPARİŞ DURUMU + STOK YÖNETİMİ
   * =========================================================
   *
   * KURAL:
   *
   * Aktif sipariş → cancelled
   * stok GERİ EKLENİR.
   *
   * cancelled → aktif
   * stok yeniden DÜŞÜRÜLÜR.
   *
   * Diğer durum geçişlerinde
   * stok değişmez.
   * =========================================================
   */
  function handleOrderStatusChange(
    order: Order,
    nextStatus: OrderStatus
  ) {
    const previousStatus =
      order.status;

    /*
     * Aynı durum tekrar seçilmişse
     * hiçbir işlem yapma.
     */
    if (
      previousStatus ===
      nextStatus
    ) {
      return;
    }

    /*
     * Siparişteki ürünleri stok
     * hareketi formatına dönüştürüyoruz.
     */
    const stockItems =
      order.items.map(
        (item) => ({
          productId:
            item.productId,

          quantity:
            item.quantity,
        })
      );

    /*
     * =======================================================
     * AKTİF → İPTAL
     * =======================================================
     *
     * Checkout aşamasında stok zaten
     * düşürüldüğü için burada geri eklenir.
     */
    if (
      previousStatus !==
        "cancelled" &&
      nextStatus ===
        "cancelled"
    ) {
      restoreProductStocks(
        stockItems
      );

      updateOrderStatus(
        order.id,
        nextStatus
      );

      return;
    }

    /*
     * =======================================================
     * İPTAL → TEKRAR AKTİF
     * =======================================================
     *
     * İptal sırasında stok geri verilmişti.
     * Dolayısıyla sipariş tekrar aktif hale
     * getirilmeden önce stok yeniden
     * rezerve edilmelidir.
     */
    if (
      previousStatus ===
        "cancelled" &&
      nextStatus !==
        "cancelled"
    ) {
      const stockReserved =
        decreaseProductStocks(
          stockItems
        );

      /*
       * Yeterli stok yoksa sipariş
       * yeniden aktif hale getirilemez.
       */
      if (!stockReserved) {
        window.alert(
          locale === "tr"
            ? "Bu siparişi yeniden aktif hale getirmek için yeterli stok bulunmuyor."
            : locale === "ar"
              ? "لا يوجد مخزون كافٍ لإعادة تنشيط هذا الطلب."
              : "There is not enough stock to reactivate this order."
        );

        return;
      }

      updateOrderStatus(
        order.id,
        nextStatus
      );

      return;
    }

    /*
     * =======================================================
     * NORMAL DURUM DEĞİŞİKLİĞİ
     * =======================================================
     *
     * Örnek:
     *
     * received → payment-confirmed
     * payment-confirmed → preparing
     * preparing → shipped
     * shipped → delivered
     *
     * Stok değişmez.
     */
    updateOrderStatus(
      order.id,
      nextStatus
    );
  }

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */
  if (!isLoaded) {
    return (
      <div className="flex min-h-[420px] items-center justify-center border-y border-border px-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          {dictionary.loading}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      {/* =====================================================
          SİPARİŞ İSTATİSTİKLERİ
      ===================================================== */}
      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <OrderStatCard
          label={
            dictionary.totalOrders
          }
          value={
            orderStats.total
          }
          icon="orders"
        />

        <OrderStatCard
          label={
            dictionary.pendingOrders
          }
          value={
            orderStats.pending
          }
        />

        <OrderStatCard
          label={
            dictionary.preparing
          }
          value={
            orderStats.preparing
          }
        />

        <OrderStatCard
          label={
            dictionary.shipped
          }
          value={
            orderStats.shipped
          }
        />

        <OrderStatCard
          label={
            dictionary.delivered
          }
          value={
            orderStats.delivered
          }
          success
        />

        <OrderStatCard
          label={
            dictionary.cancelled
          }
          value={
            orderStats.cancelled
          }
          danger
        />
      </section>

      {/* =====================================================
          ARAMA + FİLTRE
      ===================================================== */}
      <section className="relative z-10 border-y border-border py-5 sm:py-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Arama */}
          <div className="group relative">
            <Search
              size={17}
              strokeWidth={1.4}
              className="pointer-events-none absolute start-5 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-accent"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target
                    .value
                )
              }
              placeholder={
                dictionary.searchPlaceholder
              }
              autoComplete="off"
              className={[
                "h-14 w-full",
                "border border-border",
                "bg-surface/60",
                "ps-14 pe-14",
                "text-sm text-foreground",
                "outline-none",
                "transition-all duration-300",
                "placeholder:text-muted",
                "hover:border-border-strong",
                "focus:border-accent",
                "focus:bg-surface",
                "sm:h-16",
              ].join(" ")}
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery(
                    ""
                  )
                }
                aria-label={
                  dictionary.clearFilters
                }
                className="absolute end-0 top-0 flex h-full w-14 items-center justify-center text-muted transition-colors hover:text-accent"
              >
                <X
                  size={15}
                  strokeWidth={
                    1.4
                  }
                />
              </button>
            )}
          </div>

          {/* Durum filtresi */}
          <div className="relative">
            <select
              value={
                selectedStatus
              }
              onChange={(event) =>
                setSelectedStatus(
                  event.target
                    .value as
                    | OrderStatus
                    | "all"
                )
              }
              aria-label={
                dictionary.status
              }
              className={[
                "h-14 w-full",
                "appearance-none",
                "border border-border",
                "bg-surface/60",
                "px-5 pe-12",
                "text-sm text-foreground",
                "outline-none",
                "transition-all duration-300",
                "hover:border-border-strong",
                "focus:border-accent",
                "focus:bg-surface",
                "sm:h-16",
              ].join(" ")}
            >
              <option value="all">
                {
                  dictionary.allStatuses
                }
              </option>

              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {getStatusLabel(
                      status,
                      dictionary
                    )}
                  </option>
                )
              )}
            </select>

            <ChevronDown
              size={15}
              strokeWidth={1.4}
              className="pointer-events-none absolute end-5 top-1/2 -translate-y-1/2 text-muted"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          SONUÇ SAYISI
      ===================================================== */}
      <div className="flex min-h-[72px] flex-wrap items-center justify-between gap-4 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          {filteredOrders.length}{" "}
          {
            dictionary.ordersFound
          }
        </p>

        {(searchQuery ||
          selectedStatus !==
            "all") && (
          <button
            type="button"
            onClick={
              clearFilters
            }
            className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:text-accent"
          >
            <X
              size={13}
              strokeWidth={1.4}
            />

            {
              dictionary.clearFilters
            }
          </button>
        )}
      </div>

      {/* =====================================================
          SİPARİŞ YOK
      ===================================================== */}
      {filteredOrders.length ===
      0 ? (
        <div className="flex min-h-[440px] flex-col items-center justify-center border-b border-border px-5 py-12 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface/50 text-accent">
            <Package
              size={30}
              strokeWidth={1.15}
            />
          </span>

          <h2 className="mt-7 font-heading text-4xl leading-none text-foreground sm:text-5xl">
            {
              dictionary.noOrders
            }
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-foreground-soft">
            {
              dictionary.noOrdersDescription
            }
          </p>
        </div>
      ) : (
        /*
         * =====================================================
         * SİPARİŞ LİSTESİ
         * =====================================================
         */
        <div className="divide-y divide-border border-b border-border">
          {filteredOrders.map(
            (order) => (
              <AdminOrderRow
                key={order.id}
                locale={locale}
                order={order}
                dictionary={
                  dictionary
                }
                isExpanded={
                  expandedOrderId ===
                  order.id
                }
                onToggle={() =>
                  toggleOrder(
                    order.id
                  )
                }
                onStatusChange={(
                  status
                ) =>
                  handleOrderStatusChange(
                    order,
                    status
                  )
                }
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

/*
 * =============================================================
 * ORDER ROW
 * =============================================================
 */

type AdminOrderRowProps = {
  locale: Locale;

  order: Order;

  dictionary:
    AdminOrdersDictionary;

  isExpanded: boolean;

  onToggle: () => void;

  onStatusChange: (
    status: OrderStatus
  ) => void;
};

function AdminOrderRow({
  locale,
  order,
  dictionary,
  isExpanded,
  onToggle,
  onStatusChange,
}: AdminOrderRowProps) {
  const customerName = [
    order.customer.firstName,
    order.customer.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const formattedDate =
    new Intl.DateTimeFormat(
      locale,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(
      new Date(
        order.createdAt
      )
    );

  return (
    <article>
      {/* =====================================================
          ÖZET SATIRI
      ===================================================== */}
      <div className="grid gap-5 py-6 lg:grid-cols-[1.3fr_1fr_1fr_0.8fr_auto] lg:items-center">
        {/* Takip kodu */}
        <div className="min-w-0">
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-accent">
            {
              dictionary.trackingCode
            }
          </p>

          <p
            dir="ltr"
            className="mt-2 break-all font-heading text-xl tracking-[0.05em] text-foreground"
          >
            {order.trackingCode}
          </p>
        </div>

        {/* Müşteri */}
        <div className="min-w-0">
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-muted">
            {
              dictionary.customer
            }
          </p>

          <p className="mt-2 break-words text-sm font-semibold text-foreground">
            {customerName}
          </p>

          <p className="mt-1 break-all text-[10px] text-foreground-soft">
            {
              order.customer
                .email
            }
          </p>
        </div>

        {/* Tarih */}
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-muted">
            {
              dictionary.orderDate
            }
          </p>

          <p className="mt-2 text-xs leading-6 text-foreground-soft">
            {formattedDate}
          </p>
        </div>

        {/* Toplam */}
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-muted">
            {dictionary.total}
          </p>

          <p className="mt-2 font-heading text-2xl text-foreground">
            {formatPrice(
              order.total,
              order.currency,
              locale
            )}
          </p>
        </div>

        {/* Durum + detay */}
        <div className="flex flex-col items-stretch gap-3 sm:flex-row lg:flex-col">
          <OrderStatusBadge
            status={
              order.status
            }
            dictionary={
              dictionary
            }
          />

          <button
            type="button"
            onClick={onToggle}
            className={[
              "inline-flex min-h-11",
              "items-center",
              "justify-center",
              "gap-2",
              "border border-border",
              "px-5",
              "text-[9px]",
              "font-semibold",
              "uppercase",
              "tracking-[0.15em]",
              "text-foreground",
              "transition-all",
              "duration-300",
              "hover:border-accent",
              "hover:text-accent",
            ].join(" ")}
          >
            {isExpanded ? (
              <ChevronUp
                size={14}
                strokeWidth={
                  1.4
                }
              />
            ) : (
              <ChevronDown
                size={14}
                strokeWidth={
                  1.4
                }
              />
            )}

            {isExpanded
              ? dictionary.hideDetails
              : dictionary.details}
          </button>
        </div>
      </div>

      {/* =====================================================
          DETAY ALANI
      ===================================================== */}
      <div
        className={[
          "grid overflow-hidden",
          "transition-all",
          "duration-500",

          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="min-h-0">
          <div className="border-t border-border bg-surface/35 py-8">
            <div className="grid gap-8 px-5 sm:px-7 lg:grid-cols-[minmax(0,1fr)_380px]">
              {/* =================================================
                  SOL DETAY
              ================================================= */}
              <div className="min-w-0">
                {/* Müşteri + adres */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <InfoSection
                    title={
                      dictionary.customer
                    }
                  >
                    <p className="font-heading text-2xl text-foreground">
                      {customerName}
                    </p>

                    <p className="mt-3 break-all text-xs leading-6 text-foreground-soft">
                      {
                        dictionary.email
                      }
                      :{" "}
                      {
                        order.customer
                          .email
                      }
                    </p>

                    <p className="mt-1 text-xs leading-6 text-foreground-soft">
                      {
                        dictionary.phone
                      }
                      :{" "}
                      {
                        order.customer
                          .phone
                      }
                    </p>
                  </InfoSection>

                  <InfoSection
                    title={
                      dictionary.deliveryAddress
                    }
                  >
                    <address className="not-italic text-xs leading-6 text-foreground-soft">
                      <p>
                        {
                          order
                            .shippingAddress
                            .address
                        }
                      </p>

                      {order
                        .shippingAddress
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

                      {order
                        .shippingAddress
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
                  </InfoSection>
                </div>

                {/* =============================================
                    DURUM GÜNCELLEME
                ============================================= */}
                <section className="mt-6 border border-border bg-background/50 p-5 sm:p-6">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-accent">
                    {
                      dictionary.updateStatus
                    }
                  </p>

                  <div className="relative mt-4">
                    <select
                      value={
                        order.status
                      }
                      onChange={(
                        event
                      ) =>
                        onStatusChange(
                          event.target
                            .value as OrderStatus
                        )
                      }
                      className={[
                        "h-14 w-full",
                        "appearance-none",
                        "border border-border",
                        "bg-surface/70",
                        "px-5 pe-12",
                        "text-sm text-foreground",
                        "outline-none",
                        "transition-all",
                        "hover:border-border-strong",
                        "focus:border-accent",
                      ].join(" ")}
                    >
                      {STATUS_OPTIONS.map(
                        (
                          status
                        ) => (
                          <option
                            key={
                              status
                            }
                            value={
                              status
                            }
                          >
                            {getStatusLabel(
                              status,
                              dictionary
                            )}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={15}
                      strokeWidth={
                        1.4
                      }
                      className="pointer-events-none absolute end-5 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </section>

                {/* =============================================
                    DURUM GEÇMİŞİ
                ============================================= */}
                <section className="mt-6 border border-border bg-background/50 p-5 sm:p-6">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-accent">
                    {
                      dictionary.statusHistory
                    }
                  </p>

                  <div className="mt-6 space-y-0">
                    {order.statusHistory.map(
                      (
                        entry,
                        index
                      ) => {
                        const isLast =
                          index ===
                          order
                            .statusHistory
                            .length -
                            1;

                        return (
                          <div
                            key={`${entry.status}-${entry.date}`}
                            className="relative flex gap-4 pb-6 last:pb-0"
                          >
                            {!isLast && (
                              <span className="absolute start-[15px] top-8 h-[calc(100%-16px)] w-px bg-border-strong" />
                            )}

                            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent bg-accent text-white">
                              {entry.status ===
                              "shipped" ? (
                                <Truck
                                  size={
                                    13
                                  }
                                  strokeWidth={
                                    1.5
                                  }
                                />
                              ) : (
                                <Check
                                  size={
                                    13
                                  }
                                  strokeWidth={
                                    1.5
                                  }
                                />
                              )}
                            </span>

                            <div>
                              <p className="font-heading text-xl leading-none text-foreground">
                                {getStatusLabel(
                                  entry.status,
                                  dictionary
                                )}
                              </p>

                              <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-muted">
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
                                    entry.date
                                  )
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </section>
              </div>

              {/* =================================================
                  SAĞ ÜRÜN ÖZETİ
              ================================================= */}
              <aside className="border border-border bg-background/70 p-5 sm:p-6">
                <h3 className="font-heading text-3xl leading-none text-foreground">
                  {
                    dictionary.orderItems
                  }
                </h3>

                <div className="mt-6 space-y-5">
                  {order.items.map(
                    (item) => (
                      <div
                        key={
                          item.id
                        }
                        className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 border-b border-border pb-5"
                      >
                        {/* Görsel */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-surface">
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
                            className="object-cover"
                          />
                        </div>

                        {/* Ürün bilgisi */}
                        <div className="min-w-0">
                          <p className="font-heading text-xl leading-none text-foreground">
                            {
                              item.name[
                                locale
                              ]
                            }
                          </p>

                          <div className="mt-3 flex items-center gap-2">
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

                          <p className="mt-3 text-[9px] uppercase tracking-[0.12em] text-muted">
                            {
                              dictionary.quantity
                            }
                            :{" "}
                            {
                              item.quantity
                            }
                          </p>

                          <p className="mt-2 text-[10px] font-semibold text-foreground">
                            {formatPrice(
                              item.unitPrice *
                                item.quantity,

                              item.currency,

                              locale
                            )}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* =============================================
                    FİYAT ÖZETİ
                ============================================= */}
                <div className="mt-6 space-y-4 border-t border-border pt-6">
                  <PriceRow
                    label={
                      dictionary.subtotal
                    }
                    value={formatPrice(
                      order.subtotal,
                      order.currency,
                      locale
                    )}
                  />

                  <PriceRow
                    label={
                      dictionary.shipping
                    }
                    value={formatPrice(
                      order.shippingCost,
                      order.currency,
                      locale
                    )}
                  />

                  <div className="flex items-end justify-between gap-5 border-t border-border pt-5">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-foreground">
                      {
                        dictionary.orderTotal
                      }
                    </span>

                    <strong className="font-heading text-3xl font-medium text-foreground">
                      {formatPrice(
                        order.total,
                        order.currency,
                        locale
                      )}
                    </strong>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/*
 * =============================================================
 * ORDER STAT CARD
 * =============================================================
 */

type OrderStatCardProps = {
  label: string;

  value: number;

  icon?: "orders";

  success?: boolean;

  danger?: boolean;
};

function OrderStatCard({
  label,
  value,
  icon,
  success = false,
  danger = false,
}: OrderStatCardProps) {
  return (
    <article
      className={[
        "relative overflow-hidden",

        "border bg-surface/50",

        "p-5",

        "transition-all",

        "duration-300",

        "hover:-translate-y-0.5",

        danger
          ? "border-danger/30"
          : success
            ? "border-success/30"
            : "border-border",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[7px] font-semibold uppercase tracking-[0.17em] text-muted">
            {label}
          </p>

          <p
            className={[
              "mt-4 font-heading",

              "text-4xl leading-none",

              danger
                ? "text-danger"
                : success
                  ? "text-success"
                  : "text-foreground",
            ].join(" ")}
          >
            {value}
          </p>
        </div>

        {icon ===
          "orders" && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-accent/30 bg-accent/10 text-accent">
            <ShoppingBag
              size={17}
              strokeWidth={1.3}
            />
          </span>
        )}
      </div>
    </article>
  );
}

/*
 * =============================================================
 * INFO SECTION
 * =============================================================
 */

type InfoSectionProps = {
  title: string;

  children: ReactNode;
};

function InfoSection({
  title,
  children,
}: InfoSectionProps) {
  return (
    <section className="border border-border bg-background/50 p-5 sm:p-6">
      <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-accent">
        {title}
      </p>

      <div className="mt-4">
        {children}
      </div>
    </section>
  );
}

/*
 * =============================================================
 * PRICE ROW
 * =============================================================
 */

type PriceRowProps = {
  label: string;

  value: string;
};

function PriceRow({
  label,
  value,
}: PriceRowProps) {
  return (
    <div className="flex items-center justify-between gap-5">
      <span className="text-[9px] uppercase tracking-[0.15em] text-muted">
        {label}
      </span>

      <span className="text-xs font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

/*
 * =============================================================
 * STATUS BADGE
 * =============================================================
 */

type OrderStatusBadgeProps = {
  status: OrderStatus;

  dictionary:
    AdminOrdersDictionary;
};

function OrderStatusBadge({
  status,
  dictionary,
}: OrderStatusBadgeProps) {
  const isCancelled =
    status === "cancelled";

  const isDelivered =
    status === "delivered";

  return (
    <span
      className={[
        "inline-flex min-h-9",

        "items-center",

        "justify-center",

        "gap-2",

        "border px-4",

        "text-center",

        "text-[8px]",

        "font-semibold",

        "uppercase",

        "tracking-[0.13em]",

        isCancelled
          ? "border-danger/30 bg-danger/10 text-danger"
          : isDelivered
            ? "border-success/30 bg-success/10 text-success"
            : "border-accent/30 bg-accent/10 text-accent",
      ].join(" ")}
    >
      {isDelivered ? (
        <Check
          size={12}
          strokeWidth={1.5}
        />
      ) : isCancelled ? (
        <X
          size={12}
          strokeWidth={1.5}
        />
      ) : (
        <Circle
          size={7}
          fill="currentColor"
          strokeWidth={0}
        />
      )}

      {getStatusLabel(
        status,
        dictionary
      )}
    </span>
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
    AdminOrdersDictionary
) {
  const labels: Record<
    OrderStatus,
    string
  > = {
    received:
      dictionary.received,

    "payment-confirmed":
      dictionary.paymentConfirmed,

    preparing:
      dictionary.preparing,

    shipped:
      dictionary.shipped,

    delivered:
      dictionary.delivered,

    cancelled:
      dictionary.cancelled,
  };

  return labels[status];
}