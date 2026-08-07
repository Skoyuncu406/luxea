"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Eye,
  EyeOff,
  FolderTree,
  Package,
  PackageCheck,
  PackageX,
  ShoppingBag,
  Sparkles,
  Tags,
  Truck,
  UsersRound,
  Warehouse,
} from "lucide-react";

import { useCategories } from "@/contexts/CategoryContext";
import {
  useOrders,
  type OrderStatus,
} from "@/contexts/OrderContext";
import { useProducts } from "@/contexts/ProductContext";

import { formatPrice } from "@/lib/format-price";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/types/product";

type AdminDashboardDictionary = {
  totalRevenue: string;
  totalOrders: string;
  totalCustomers: string;

  pendingOrders: string;
  preparingOrders: string;
  shippedOrders: string;
  deliveredOrders: string;

  totalProducts: string;
  activeProducts: string;
  inactiveProducts: string;
  featuredProducts: string;
  lowStockProducts: string;
  outOfStockProducts: string;

  totalCategories: string;
  activeCategories: string;

  inventoryOverview: string;
  catalogOverview: string;

  recentOrders: string;
  viewAllOrders: string;

  trackingCode: string;
  customer: string;
  orderDate: string;
  total: string;
  status: string;

  noOrders: string;
  loading: string;

  received: string;
  paymentConfirmed: string;
  preparing: string;
  shipped: string;
  delivered: string;
  cancelled: string;
};

type AdminDashboardContentProps = {
  locale: Locale;
  dictionary: AdminDashboardDictionary;
};

const LOW_STOCK_LIMIT = 5;

export default function AdminDashboardContent({
  locale,
  dictionary,
}: AdminDashboardContentProps) {
  const {
    products,
    isLoaded: productsLoaded,
  } = useProducts();

  const {
    categories,
    isLoaded: categoriesLoaded,
  } = useCategories();

  const {
    orders,
    isLoaded: ordersLoaded,
  } = useOrders();

  const isLoaded =
    productsLoaded &&
    categoriesLoaded &&
    ordersLoaded;

  const dashboardData = useMemo(() => {
    /*
     * =========================================================
     * ÜRÜNLER
     * =========================================================
     */

    const activeProducts =
      products.filter(
        (product) => product.isActive
      );

    const inactiveProducts =
      products.filter(
        (product) => !product.isActive
      );

    const featuredProducts =
      products.filter(
        (product) =>
          product.isFeatured
      );

    const lowStockProducts =
      products.filter(
        (product) =>
          product.stock > 0 &&
          product.stock <=
            LOW_STOCK_LIMIT
      );

    const outOfStockProducts =
      products.filter(
        (product) =>
          product.stock <= 0
      );

    /*
     * =========================================================
     * KATEGORİLER
     * =========================================================
     */

    const activeCategories =
      categories.filter(
        (category) =>
          category.isActive
      );

    /*
     * =========================================================
     * SİPARİŞLER
     * =========================================================
     */

    const activeOrders =
      orders.filter(
        (order) =>
          order.status !==
          "cancelled"
      );

    const countByStatus = (
      status: OrderStatus
    ) =>
      orders.filter(
        (order) =>
          order.status === status
      ).length;

    const pendingOrders =
      countByStatus("received") +
      countByStatus(
        "payment-confirmed"
      );

    /*
     * =========================================================
     * MÜŞTERİLER
     * =========================================================
     */

    const customerEmails =
      new Set(
        orders
          .map((order) =>
            order.customer.email
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      );

    /*
     * =========================================================
     * GELİR
     *
     * Farklı para birimlerini birbirine
     * eklemiyoruz.
     *
     * EUR, USD ve GBP ayrı hesaplanıyor.
     * =========================================================
     */

    const revenueByCurrency =
      activeOrders.reduce(
        (
          totals,
          order
        ) => {
          const currency =
            order.currency as
              | "EUR"
              | "USD"
              | "GBP";

          totals[currency] =
            (totals[currency] ??
              0) +
            order.total;

          return totals;
        },
        {
          EUR: 0,
          USD: 0,
          GBP: 0,
        } as Record<
          Product["currency"],
          number
        >
      );

    /*
     * =========================================================
     * SON SİPARİŞLER
     * =========================================================
     */

    const recentOrders = [
      ...orders,
    ]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      )
      .slice(0, 5);

    return {
      /*
       * Products
       */
      totalProducts:
        products.length,

      activeProducts:
        activeProducts.length,

      inactiveProducts:
        inactiveProducts.length,

      featuredProducts:
        featuredProducts.length,

      lowStockProducts:
        lowStockProducts.length,

      outOfStockProducts:
        outOfStockProducts.length,

      /*
       * Categories
       */
      totalCategories:
        categories.length,

      activeCategories:
        activeCategories.length,

      /*
       * Orders
       */
      totalOrders:
        orders.length,

      pendingOrders,

      preparingOrders:
        countByStatus(
          "preparing"
        ),

      shippedOrders:
        countByStatus("shipped"),

      deliveredOrders:
        countByStatus(
          "delivered"
        ),

      /*
       * Customers
       */
      totalCustomers:
        customerEmails.size,

      /*
       * Revenue
       */
      revenueByCurrency,

      /*
       * Recent
       */
      recentOrders,
    };
  }, [
    products,
    categories,
    orders,
  ]);

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

  /*
   * =========================================================
   * GELİR METNİ
   * =========================================================
   */

  const revenueParts: string[] =
    [];

  if (
    dashboardData
      .revenueByCurrency.EUR >
    0
  ) {
    revenueParts.push(
      formatPrice(
        dashboardData
          .revenueByCurrency.EUR,
        "EUR",
        locale
      )
    );
  }

  if (
    dashboardData
      .revenueByCurrency.USD >
    0
  ) {
    revenueParts.push(
      formatPrice(
        dashboardData
          .revenueByCurrency.USD,
        "USD",
        locale
      )
    );
  }

  if (
    dashboardData
      .revenueByCurrency.GBP >
    0
  ) {
    revenueParts.push(
      formatPrice(
        dashboardData
          .revenueByCurrency.GBP,
        "GBP",
        locale
      )
    );
  }

  const revenueText =
    revenueParts.length > 0
      ? revenueParts.join(" · ")
      : formatPrice(
          0,
          "EUR",
          locale
        );

  /*
   * =========================================================
   * ÜST GENEL İSTATİSTİKLER
   * =========================================================
   */

  const generalStats = [
    {
      label:
        dictionary.totalRevenue,
      value: revenueText,
      icon: CircleDollarSign,
      featured: true,
    },
    {
      label:
        dictionary.totalOrders,
      value:
        dashboardData.totalOrders.toString(),
      icon: ShoppingBag,
    },
    {
      label:
        dictionary.totalCustomers,
      value:
        dashboardData.totalCustomers.toString(),
      icon: UsersRound,
    },
    {
      label:
        dictionary.pendingOrders,
      value:
        dashboardData.pendingOrders.toString(),
      icon: Clock3,
    },
  ];

  /*
   * =========================================================
   * ÜRÜN İSTATİSTİKLERİ
   * =========================================================
   */

  const productStats = [
    {
      label:
        dictionary.totalProducts,
      value:
        dashboardData.totalProducts.toString(),
      icon: Package,
    },
    {
      label:
        dictionary.activeProducts,
      value:
        dashboardData.activeProducts.toString(),
      icon: Eye,
    },
    {
      label:
        dictionary.inactiveProducts,
      value:
        dashboardData.inactiveProducts.toString(),
      icon: EyeOff,
    },
    {
      label:
        dictionary.featuredProducts,
      value:
        dashboardData.featuredProducts.toString(),
      icon: Sparkles,
    },
    {
      label:
        dictionary.lowStockProducts,
      value:
        dashboardData.lowStockProducts.toString(),
      icon: Warehouse,
      warning:
        dashboardData.lowStockProducts >
        0,
    },
    {
      label:
        dictionary.outOfStockProducts,
      value:
        dashboardData.outOfStockProducts.toString(),
      icon: PackageX,
      danger:
        dashboardData.outOfStockProducts >
        0,
    },
  ];

  /*
   * =========================================================
   * KATEGORİ + SİPARİŞ DURUMU
   * =========================================================
   */

  const secondaryStats = [
    {
      label:
        dictionary.totalCategories,
      value:
        dashboardData.totalCategories.toString(),
      icon: FolderTree,
    },
    {
      label:
        dictionary.activeCategories,
      value:
        dashboardData.activeCategories.toString(),
      icon: Tags,
    },
    {
      label:
        dictionary.preparingOrders,
      value:
        dashboardData.preparingOrders.toString(),
      icon: PackageCheck,
    },
    {
      label:
        dictionary.shippedOrders,
      value:
        dashboardData.shippedOrders.toString(),
      icon: Truck,
    },
    {
      label:
        dictionary.deliveredOrders,
      value:
        dashboardData.deliveredOrders.toString(),
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="w-full min-w-0">
      {/* =====================================================
          GENEL İSTATİSTİKLER
      ===================================================== */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {generalStats.map(
          (stat) => (
            <DashboardStatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              featured={
                stat.featured
              }
            />
          )
        )}
      </section>

      {/* =====================================================
          KATALOG / ÜRÜN DURUMU
      ===================================================== */}
      <section className="mt-10">
        <SectionHeading
          eyebrow="LUXEA ADMIN"
          title={
            dictionary.catalogOverview
          }
          action={
            <Link
              href={`/${locale}/admin/products`}
              className="group inline-flex min-h-11 items-center justify-center gap-3 border border-border px-5 text-[9px] font-semibold uppercase tracking-[0.15em] text-foreground transition-all duration-300 hover:border-accent hover:bg-accent hover:!text-white"
            >
              <span>
                {
                  dictionary.totalProducts
                }
              </span>

              <ArrowUpRight
                size={14}
                strokeWidth={1.4}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              />
            </Link>
          }
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productStats.map(
            (stat) => (
              <DashboardStatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                warning={
                  stat.warning
                }
                danger={
                  stat.danger
                }
              />
            )
          )}
        </div>
      </section>

      {/* =====================================================
          KATEGORİ + SİPARİŞ DURUMU
      ===================================================== */}
      <section className="mt-10">
        <SectionHeading
          eyebrow="LUXEA ADMIN"
          title={
            dictionary.inventoryOverview
          }
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {secondaryStats.map(
            (stat) => (
              <DashboardStatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                compact
              />
            )
          )}
        </div>
      </section>

      {/* =====================================================
          SON SİPARİŞLER
      ===================================================== */}
      <section className="mt-10 border border-border bg-surface/45">
        <div className="flex flex-col gap-5 border-b border-border px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-accent">
              LUXEA ADMIN
            </p>

            <h2 className="mt-2 font-heading text-4xl leading-none text-foreground">
              {
                dictionary.recentOrders
              }
            </h2>
          </div>

          <Link
            href={`/${locale}/admin/orders`}
            className={[
              "group inline-flex min-h-11",
              "items-center justify-center gap-3",
              "border border-border px-5",
              "text-[9px] font-semibold uppercase",
              "tracking-[0.15em] text-foreground",
              "transition-all duration-300",
              "hover:border-accent",
              "hover:bg-accent",
              "hover:!text-white",
            ].join(" ")}
          >
            <span>
              {
                dictionary.viewAllOrders
              }
            </span>

            <ArrowUpRight
              size={14}
              strokeWidth={1.4}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
            />
          </Link>
        </div>

        {dashboardData
          .recentOrders.length ===
        0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-5 py-12 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background/60 text-accent">
              <ShoppingBag
                size={26}
                strokeWidth={1.2}
              />
            </span>

            <p className="mt-6 font-heading text-3xl text-foreground">
              {dictionary.noOrders}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {dashboardData.recentOrders.map(
              (order) => {
                const customerName = [
                  order.customer
                    .firstName,
                  order.customer
                    .lastName,
                ]
                  .filter(Boolean)
                  .join(" ");

                const formattedDate =
                  new Intl.DateTimeFormat(
                    locale,
                    {
                      dateStyle:
                        "medium",
                      timeStyle:
                        "short",
                    }
                  ).format(
                    new Date(
                      order.createdAt
                    )
                  );

                return (
                  <article
                    key={order.id}
                    className={[
                      "grid gap-5 px-5 py-6",
                      "sm:px-7",
                      "lg:grid-cols-[1.2fr_1fr_1fr_0.8fr_0.8fr]",
                      "lg:items-center",
                    ].join(" ")}
                  >
                    {/* Takip kodu */}
                    <div className="min-w-0">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-accent">
                        {
                          dictionary.trackingCode
                        }
                      </p>

                      <p
                        dir="ltr"
                        className="mt-2 break-all font-heading text-xl tracking-[0.05em] text-foreground"
                      >
                        {
                          order.trackingCode
                        }
                      </p>
                    </div>

                    {/* Müşteri */}
                    <div className="min-w-0">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted">
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
                      <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted">
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
                      <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted">
                        {
                          dictionary.total
                        }
                      </p>

                      <p className="mt-2 font-heading text-2xl text-foreground">
                        {formatPrice(
                          order.total,
                          order.currency,
                          locale
                        )}
                      </p>
                    </div>

                    {/* Durum */}
                    <div>
                      <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted">
                        {
                          dictionary.status
                        }
                      </p>

                      <span
                        className={[
                          "mt-2 inline-flex min-h-9",
                          "items-center justify-center",
                          "border px-4",
                          "text-[8px] font-semibold",
                          "uppercase tracking-[0.13em]",

                          order.status ===
                          "cancelled"
                            ? "border-danger/30 bg-danger/10 text-danger"
                            : order.status ===
                                "delivered"
                              ? "border-success/30 bg-success/10 text-success"
                              : "border-accent/30 bg-accent/10 text-accent",
                        ].join(" ")}
                      >
                        {getStatusLabel(
                          order.status,
                          dictionary
                        )}
                      </span>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/*
 * =============================================================
 * STAT CARD
 * =============================================================
 */

type DashboardStatCardProps = {
  label: string;
  value: string;
  icon: React.ElementType;
  featured?: boolean;
  compact?: boolean;
  warning?: boolean;
  danger?: boolean;
};

function DashboardStatCard({
  label,
  value,
  icon: Icon,
  featured = false,
  compact = false,
  warning = false,
  danger = false,
}: DashboardStatCardProps) {
  return (
    <article
      className={[
        "relative overflow-hidden",
        "border bg-surface/55",
        "transition-all duration-300",

        compact ? "p-5" : "p-6",

        danger
          ? "border-danger/35"
          : warning
            ? "border-warning/35"
            : "border-border",

        "hover:-translate-y-1",
        "hover:shadow-[0_22px_55px_rgba(36,35,32,0.08)]",

        featured
          ? "sm:col-span-2"
          : "",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className={[
          "absolute -end-10 -top-10",
          "h-28 w-28 rounded-full",
          "blur-2xl",

          danger
            ? "bg-danger/10"
            : warning
              ? "bg-warning/10"
              : "bg-accent/8",
        ].join(" ")}
      />

      <div className="relative z-10 flex items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-muted">
            {label}
          </p>

          <p
            className={[
              "mt-5 break-words",
              "font-heading leading-none",

              danger
                ? "text-danger"
                : warning
                  ? "text-warning"
                  : "text-foreground",

              featured
                ? "text-3xl sm:text-4xl lg:text-5xl"
                : compact
                  ? "text-3xl"
                  : "text-4xl",
            ].join(" ")}
          >
            {value}
          </p>
        </div>

        <span
          className={[
            "flex h-11 w-11 shrink-0",
            "items-center justify-center",
            "border",

            danger
              ? "border-danger/30 bg-danger/10 text-danger"
              : warning
                ? "border-warning/30 bg-warning/10 text-warning"
                : "border-accent/30 bg-accent/10 text-accent",
          ].join(" ")}
        >
          <Icon
            size={19}
            strokeWidth={1.25}
          />
        </span>
      </div>
    </article>
  );
}

/*
 * =============================================================
 * SECTION HEADING
 * =============================================================
 */

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-accent">
          {eyebrow}
        </p>

        <h2 className="mt-2 font-heading text-4xl leading-none text-foreground">
          {title}
        </h2>
      </div>

      {action}
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
  dictionary: AdminDashboardDictionary
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