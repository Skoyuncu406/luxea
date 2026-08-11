"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Clock3,
  LoaderCircle,
  Package,
  PackageCheck,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import type {
  Locale,
} from "@/lib/i18n/config";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type OrderStatus =
  | "received"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

type Currency =
  | "EUR"
  | "USD"
  | "GBP";

type OrderItem = {
  id: string;

  productId: string;

  slug: string;

  name: {
    tr: string;
    en: string;
    ar: string;
  };

  image: string;

  color: string;

  quantity: number;

  unitPrice: number;

  currency: Currency;
};

type MyOrder = {
  id: string;

  orderNumber: string;

  trackingCode: string;

  customer: {
    email: string;

    firstName: string;
    lastName: string;

    phone: string;
  };

  shippingAddress: {
    country: string;

    address: string;

    addressLineTwo?: string;

    city: string;

    state?: string;

    postalCode: string;
  };

  items: OrderItem[];

  subtotal: number;

  shippingCost: number;

  total: number;

  currency: Currency;

  status: OrderStatus;

  statusHistory: {
    status: OrderStatus;

    date: string;
  }[];

  createdAt: string;

  updatedAt: string;
};

type OrdersResponse = {
  success: boolean;

  orders?: MyOrder[];

  message?: string;
};

type MyOrdersContentProps = {
  locale: Locale;
};

/*
 * ============================================================
 * DICTIONARY
 * ============================================================
 */

const dictionary = {
  tr: {
    eyebrow:
      "Hesabınıza Bağlı Siparişler",

    title:
      "Sipariş geçmişiniz.",

    description:
      "Hesabınızla verdiğiniz mevcut ve geçmiş siparişleri buradan takip edebilirsiniz.",

    emptyTitle:
      "Henüz hesabınıza bağlı sipariş yok.",

    emptyDescription:
      "Giriş yaptıktan sonra verdiğiniz siparişler burada otomatik olarak görüntülenecek.",

    startShopping:
      "Alışverişe Başla",

    orderNumber:
      "Sipariş No",

    trackingCode:
      "Takip Kodu",

    orderDate:
      "Sipariş Tarihi",

    total:
      "Sipariş Durumu",

    products:
      "Ürünler",

    product:
      "ürün",

    viewOrder:
      "Siparişi Görüntüle",

    received:
      "Sipariş Alındı",

    preparing:
      "Hazırlanıyor",

    shipped:
      "Kargoya Verildi",

    delivered:
      "Teslim Edildi",

    cancelled:
      "İptal Edildi",

    loadError:
      "Siparişleriniz yüklenemedi.",

    loading:
      "Siparişleriniz yükleniyor",
  },

  en: {
    eyebrow:
      "Orders Linked to Your Account",

    title:
      "Your order history.",

    description:
      "View and track current and previous orders placed with your account.",

    emptyTitle:
      "No orders are linked to your account yet.",

    emptyDescription:
      "Orders placed while signed in will automatically appear here.",

    startShopping:
      "Start Shopping",

    orderNumber:
      "Order No.",

    trackingCode:
      "Tracking Code",

    orderDate:
      "Order Date",

    total:
      "Order Status",

    products:
      "Products",

    product:
      "item",

    viewOrder:
      "View Order",

    received:
      "Order Received",

    preparing:
      "Preparing",

    shipped:
      "Shipped",

    delivered:
      "Delivered",

    cancelled:
      "Cancelled",

    loadError:
      "Your orders could not be loaded.",

    loading:
      "Loading your orders",
  },

  ar: {
    eyebrow:
      "الطلبات المرتبطة بحسابك",

    title:
      "سجل طلباتك.",

    description:
      "يمكنك عرض وتتبع طلباتك الحالية والسابقة المرتبطة بحسابك.",

    emptyTitle:
      "لا توجد طلبات مرتبطة بحسابك حتى الآن.",

    emptyDescription:
      "ستظهر الطلبات التي تقوم بها أثناء تسجيل الدخول هنا تلقائياً.",

    startShopping:
      "ابدأ التسوق",

    orderNumber:
      "رقم الطلب",

    trackingCode:
      "رمز التتبع",

    orderDate:
      "تاريخ الطلب",

    total:
      "حالة الطلب",

    products:
      "المنتجات",

    product:
      "منتج",

    viewOrder:
      "عرض الطلب",

    received:
      "تم استلام الطلب",

    preparing:
      "قيد التجهيز",

    shipped:
      "تم الشحن",

    delivered:
      "تم التسليم",

    cancelled:
      "تم الإلغاء",

    loadError:
      "تعذر تحميل طلباتك.",

    loading:
      "جارٍ تحميل طلباتك",
  },
} as const;

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function MyOrdersContent({
  locale,
}: MyOrdersContentProps) {
  const content =
    dictionary[locale];

  const [
    orders,
    setOrders,
  ] = useState<MyOrder[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /*
   * ==========================================================
   * LOAD ORDERS
   * ==========================================================
   */

  const loadOrders =
    useCallback(
      async () => {
        try {
          setIsLoading(true);

          setError("");

          const response =
            await fetch(
              "/api/orders/my",
              {
                method: "GET",

                credentials:
                  "include",

                cache:
                  "no-store",
              }
            );

          /*
           * Guest kullanıcı.
           *
           * Hata göstermiyoruz çünkü aşağıdaki
           * tracking-code sistemi guest için
           * kullanılmaya devam edecek.
           */

          if (
            response.status ===
            401
          ) {
            setIsAuthenticated(
              false
            );

            setOrders([]);

            return;
          }

          const data =
            (await response.json()) as
              OrdersResponse;

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
                content.loadError
            );
          }

          setIsAuthenticated(
            true
          );

          setOrders(
            Array.isArray(
              data.orders
            )
              ? data.orders
              : []
          );
        } catch (
          requestError
        ) {
          setError(
            requestError instanceof
              Error
              ? requestError.message
              : content.loadError
          );
        } finally {
          setIsLoading(false);
        }
      },
      [
        content.loadError,
      ]
    );

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (isLoading) {
    return (
      <section
        className="
          mx-auto
          mt-12
          flex
          min-h-[240px]
          w-full
          max-w-[1100px]
          flex-col
          items-center
          justify-center
          border-y
          border-border
          px-5
          text-center
        "
      >
        <LoaderCircle
          size={26}
          strokeWidth={1.2}
          className="
            animate-spin
            text-accent
          "
        />

        <p
          className="
            mt-5
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.2em]
            text-muted
          "
        >
          {content.loading}
        </p>
      </section>
    );
  }

  /*
   * ==========================================================
   * GUEST
   * ==========================================================
   *
   * Guest kullanıcı için bu bölüm hiç gösterilmez.
   *
   * Böylece mevcut OrderTrackingContent doğrudan
   * guest sipariş takip ekranı olarak kalır.
   */

  if (!isAuthenticated) {
    return null;
  }

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <section
      className="
        mx-auto
        mt-12
        w-full
        max-w-[1100px]
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[720px]
          flex-col
          items-center
          text-center
        "
      >
        <p
          className="
            w-full
            text-center
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.26em]
            text-accent
          "
        >
          {content.eyebrow}
        </p>

        <h2
          className="
            mt-3
            w-full
            text-center
            font-heading
            text-4xl
            leading-none
            text-foreground
            sm:text-5xl
          "
        >
          {content.title}
        </h2>

        <p
          className="
            mx-auto
            mt-4
            max-w-[580px]
            text-center
            text-xs
            leading-6
            text-foreground-soft
            sm:text-sm
          "
        >
          {content.description}
        </p>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          role="alert"
          className="
            mx-auto
            mt-7
            max-w-[760px]
            border
            border-danger/25
            bg-danger/[0.04]
            px-5
            py-3
          "
        >
          <p
            className="
              text-center
              text-xs
              leading-5
              text-danger
            "
          >
            {error}
          </p>
        </div>
      )}

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!error &&
        orders.length === 0 && (
          <div
            className="
              mt-8
              flex
              min-h-[300px]
              flex-col
              items-center
              justify-center
              border-y
              border-border
              px-6
              py-12
              text-center
            "
          >
            <span
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                border
                border-accent/25
                bg-accent/[0.05]
                text-accent
              "
            >
              <ShoppingBag
                size={24}
                strokeWidth={1.2}
              />
            </span>

            <h3
              className="
                mt-6
                text-center
                font-heading
                text-3xl
                leading-none
                text-foreground
                sm:text-4xl
              "
            >
              {
                content.emptyTitle
              }
            </h3>

            <p
              className="
                mx-auto
                mt-4
                max-w-[500px]
                text-center
                text-xs
                leading-6
                text-foreground-soft
                sm:text-sm
              "
            >
              {
                content.emptyDescription
              }
            </p>

            <Link
              href={`/${locale}/products`}
              className="
                group
                mt-7
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-3
                border
                border-foreground
                bg-foreground
                px-7
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-white
                transition-all
                duration-300
                hover:border-accent
                hover:bg-accent
              "
            >
              {
                content.startShopping
              }

              <ArrowRight
                size={14}
                strokeWidth={1.3}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                  rtl:rotate-180
                  rtl:group-hover:-translate-x-1
                "
              />
            </Link>
          </div>
        )}

      {/* =====================================================
          ORDERS
      ===================================================== */}

      {!error &&
        orders.length > 0 && (
          <div
            className="
              mt-9
              space-y-6
            "
          >
            {orders.map(
              (order) => (
                <OrderCard
                  key={order.id}
                  locale={locale}
                  order={order}
                />
              )
            )}
          </div>
        )}
    </section>
  );
}

/*
 * ============================================================
 * ORDER CARD
 * ============================================================
 */

type OrderCardProps = {
  locale: Locale;

  order: MyOrder;
};

function OrderCard({
  locale,
  order,
}: OrderCardProps) {
  const content =
    dictionary[locale];

  const date =
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

  const status =
    getStatusData(
      order.status,
      locale
    );

  const itemCount =
    order.items.reduce(
      (
        total,
        item
      ) =>
        total +
        item.quantity,
      0
    );

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        border
        border-border
        bg-surface/30
        px-5
        py-6
        transition-all
        duration-500
        hover:border-accent/40
        hover:bg-surface/55
        hover:shadow-[0_24px_70px_rgba(36,35,32,0.06)]
        sm:px-7
        sm:py-7
      "
    >
      {/* =====================================================
          TOP
      ===================================================== */}

      <div
        className="
          flex
          flex-col
          items-center
          justify-between
          gap-5
          border-b
          border-border
          pb-6
          text-center
          lg:flex-row
          lg:text-start
        "
      >
        <div
          className="
            flex
            min-w-0
            flex-col
            items-center
            lg:items-start
          "
        >
          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-3
              lg:justify-start
            "
          >
            <span
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                border
                border-accent/25
                bg-accent/[0.05]
                text-accent
              "
            >
              {status.icon}
            </span>

            <div>
              <p
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-muted
                "
              >
                {content.orderNumber}
              </p>

              <p
                dir="ltr"
                className="
                  mt-1
                  font-heading
                  text-xl
                  tracking-[0.04em]
                  text-foreground
                "
              >
                {order.orderNumber}
              </p>
            </div>
          </div>
        </div>

        <span
          className={[
            "inline-flex",
            "min-h-9",
            "items-center",
            "justify-center",
            "border",
            "px-4",
            "text-[8px]",
            "font-semibold",
            "uppercase",
            "tracking-[0.14em]",
            status.className,
          ].join(" ")}
        >
          {status.label}
        </span>
      </div>

      {/* =====================================================
          INFORMATION
      ===================================================== */}

      <div
        className="
          grid
          gap-5
          border-b
          border-border
          py-6
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >
        <Information
          label={
            content.trackingCode
          }
          value={
            order.trackingCode
          }
          dir="ltr"
        />

        <Information
          label={
            content.orderDate
          }
          value={date}
        />

        <Information
          label={
            content.products
          }
          value={`${itemCount} ${content.product}`}
        />

        <Information
          label={
            content.total
          }
          value={
            status.label
          }
        />
      </div>

      {/* =====================================================
          ITEMS
      ===================================================== */}

      <div
        className="
          mt-6
          flex
          flex-wrap
          items-center
          justify-center
          gap-4
          lg:justify-start
        "
      >
        {order.items
          .slice(0, 4)
          .map(
            (item) => (
              <Link
                key={item.id}
                href={`/${locale}/products/${item.slug}`}
                className="
                  group/item
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    relative
                    h-[72px]
                    w-[58px]
                    shrink-0
                    overflow-hidden
                    bg-background
                  "
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
                    sizes="58px"
                    className="
                      object-cover
                      object-center
                      transition-transform
                      duration-500
                      group-hover/item:scale-[1.04]
                    "
                  />
                </div>

                <div
                  className="
                    hidden
                    max-w-[150px]
                    sm:block
                  "
                >
                  <p
                    className="
                      line-clamp-2
                      font-heading
                      text-lg
                      leading-none
                      text-foreground
                      transition-colors
                      duration-300
                      group-hover/item:text-accent
                    "
                  >
                    {
                      item.name[
                        locale
                      ]
                    }
                  </p>

                  <p
                    className="
                      mt-2
                      text-[8px]
                      uppercase
                      tracking-[0.12em]
                      text-muted
                    "
                  >
                    × {item.quantity}
                  </p>
                </div>
              </Link>
            )
          )}

        {order.items.length >
          4 && (
          <span
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.13em]
              text-muted
            "
          >
            +
            {order.items.length -
              4}
          </span>
        )}
      </div>

      {/* =====================================================
          BUTTON
      ===================================================== */}

      <div
        className="
          mt-7
          flex
          justify-center
          lg:justify-end
        "
      >
        <Link
          href={`/${locale}/account/orders?code=${encodeURIComponent(
            order.trackingCode
          )}`}
          className="
            group/button
            inline-flex
            min-h-12
            items-center
            justify-center
            gap-3
            border
            border-foreground
            px-6
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.16em]
            text-foreground
            transition-all
            duration-300
            hover:border-accent
            hover:bg-accent
            hover:text-white
          "
        >
          {
            content.viewOrder
          }

          <ArrowRight
            size={13}
            strokeWidth={1.3}
            className="
              transition-transform
              duration-300
              group-hover/button:translate-x-1
              rtl:rotate-180
              rtl:group-hover/button:-translate-x-1
            "
          />
        </Link>
      </div>

      <span
        className="
          absolute
          bottom-0
          left-1/2
          h-px
          w-0
          -translate-x-1/2
          bg-accent
          transition-all
          duration-700
          group-hover:w-[75%]
        "
      />
    </article>
  );
}

/*
 * ============================================================
 * INFORMATION
 * ============================================================
 */

type InformationProps = {
  label: string;

  value: string;

  dir?: "ltr" | "rtl";
};

function Information({
  label,
  value,
  dir,
}: InformationProps) {
  return (
    <div
      className="
        flex
        min-w-0
        flex-col
        items-center
        text-center
      "
    >
      <p
        className="
          text-[7px]
          font-semibold
          uppercase
          tracking-[0.17em]
          text-accent
        "
      >
        {label}
      </p>

      <p
        dir={dir}
        className="
          mt-2
          break-words
          text-center
          text-xs
          leading-5
          text-foreground-soft
        "
      >
        {value}
      </p>
    </div>
  );
}

/*
 * ============================================================
 * STATUS
 * ============================================================
 */

function getStatusData(
  status: OrderStatus,
  locale: Locale
) {
  const content =
    dictionary[locale];

  switch (status) {
    case "received":
      return {
        label:
          content.received,

        icon: (
          <Package
            size={18}
            strokeWidth={1.25}
          />
        ),

        className:
          "border-accent/30 bg-accent/[0.06] text-accent",
      };

    case "preparing":
      return {
        label:
          content.preparing,

        icon: (
          <Clock3
            size={18}
            strokeWidth={1.25}
          />
        ),

        className:
          "border-accent/30 bg-accent/[0.06] text-accent",
      };

    case "shipped":
      return {
        label:
          content.shipped,

        icon: (
          <Truck
            size={18}
            strokeWidth={1.25}
          />
        ),

        className:
          "border-accent/30 bg-accent/[0.06] text-accent",
      };

    case "delivered":
      return {
        label:
          content.delivered,

        icon: (
          <PackageCheck
            size={18}
            strokeWidth={1.25}
          />
        ),

        className:
          "border-success/30 bg-success/[0.08] text-success",
      };

    case "cancelled":
      return {
        label:
          content.cancelled,

        icon: (
          <XCircle
            size={18}
            strokeWidth={1.25}
          />
        ),

        className:
          "border-danger/30 bg-danger/[0.08] text-danger",
      };
  }
}