"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/*
 * =============================================================
 * TYPES
 * =============================================================
 */

export type Currency =
  | "EUR"
  | "USD"
  | "GBP";

export type OrderStatus =
  | "received"
  | "payment-confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
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

export type OrderCustomer = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type OrderShippingAddress = {
  country: string;
  address: string;
  addressLineTwo?: string;
  city: string;
  state?: string;
  postalCode: string;
};

export type OrderStatusHistory = {
  status: OrderStatus;
  date: string;
};

export type Order = {
  id: string;
  trackingCode: string;

  customer: OrderCustomer;
  shippingAddress: OrderShippingAddress;

  items: OrderItem[];

  subtotal: number;
  shippingCost: number;
  total: number;

  currency: Currency;

  status: OrderStatus;

  statusHistory: OrderStatusHistory[];

  createdAt: string;
  updatedAt: string;
};

/*
 * Checkout mevcut yapısını kırmamak için
 * eski CreateOrderInput şeklini koruyoruz.
 *
 * Ancak subtotal / fiyat / currency gibi değerler
 * artık server tarafında güvenilir kaynak değildir.
 *
 * /api/orders gerçek ürünleri PostgreSQL'den okuyup
 * fiyat ve toplamları kendisi hesaplar.
 */

export type CreateOrderInput = {
  customer: OrderCustomer;

  shippingAddress:
    OrderShippingAddress;

  items: OrderItem[];

  subtotal: number;

  shippingCost?: number;

  currency: Currency;
};

/*
 * =============================================================
 * API RESPONSE TYPES
 * =============================================================
 */

type OrdersApiResponse = {
  success: boolean;
  orders?: Order[];
  message?: string;
};

type OrderApiResponse = {
  success: boolean;
  order?: Order;
  message?: string;
};

/*
 * =============================================================
 * CONTEXT
 * =============================================================
 */

type OrderContextValue = {
  orders: Order[];

  isLoaded: boolean;

  isLoading: boolean;

  error: string | null;

  refreshOrders:
    () => Promise<void>;

  createOrder: (
    input: CreateOrderInput
  ) => Promise<Order>;

  findOrderByTrackingCode: (
    trackingCode: string
  ) => Order | undefined;

  fetchOrderByTrackingCode: (
    trackingCode: string
  ) => Promise<Order | undefined>;

  updateOrderStatus: (
    orderId: string,
    status: OrderStatus
  ) => Promise<Order>;
};

type OrderProviderProps = {
  children: ReactNode;
};

const OrderContext =
  createContext<OrderContextValue | null>(
    null
  );

/*
 * =============================================================
 * VALIDATION CONSTANTS
 * =============================================================
 */

const VALID_ORDER_STATUSES:
  OrderStatus[] = [
    "received",
    "payment-confirmed",
    "preparing",
    "shipped",
    "delivered",
    "cancelled",
  ];

const SUPPORTED_CURRENCIES:
  Currency[] = [
    "EUR",
    "USD",
    "GBP",
  ];

/*
 * =============================================================
 * TYPE GUARDS
 * =============================================================
 */

function isOrderStatus(
  value: unknown
): value is OrderStatus {
  return (
    typeof value === "string" &&
    VALID_ORDER_STATUSES.includes(
      value as OrderStatus
    )
  );
}

function isCurrency(
  value: unknown
): value is Currency {
  return (
    typeof value === "string" &&
    SUPPORTED_CURRENCIES.includes(
      value as Currency
    )
  );
}

function isOrderItem(
  value: unknown
): value is OrderItem {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const item =
    value as Partial<OrderItem>;

  if (
    typeof item.name !==
      "object" ||
    item.name === null
  ) {
    return false;
  }

  return (
    typeof item.id === "string" &&
    typeof item.productId ===
      "string" &&
    typeof item.slug === "string" &&
    typeof item.image === "string" &&
    typeof item.color === "string" &&
    typeof item.quantity ===
      "number" &&
    Number.isInteger(
      item.quantity
    ) &&
    item.quantity > 0 &&
    typeof item.unitPrice ===
      "number" &&
    Number.isFinite(
      item.unitPrice
    ) &&
    item.unitPrice >= 0 &&
    isCurrency(
      item.currency
    ) &&
    typeof item.name.tr ===
      "string" &&
    typeof item.name.en ===
      "string" &&
    typeof item.name.ar ===
      "string"
  );
}

function isOrderCustomer(
  value: unknown
): value is OrderCustomer {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const customer =
    value as Partial<OrderCustomer>;

  return (
    typeof customer.email ===
      "string" &&
    typeof customer.firstName ===
      "string" &&
    typeof customer.lastName ===
      "string" &&
    typeof customer.phone ===
      "string"
  );
}

function isShippingAddress(
  value: unknown
): value is OrderShippingAddress {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const address =
    value as Partial<OrderShippingAddress>;

  return (
    typeof address.country ===
      "string" &&
    typeof address.address ===
      "string" &&
    typeof address.city ===
      "string" &&
    typeof address.postalCode ===
      "string" &&
    (
      address.addressLineTwo ===
        undefined ||
      typeof address.addressLineTwo ===
        "string"
    ) &&
    (
      address.state ===
        undefined ||
      typeof address.state ===
        "string"
    )
  );
}

function isStatusHistoryEntry(
  value: unknown
): value is OrderStatusHistory {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const entry =
    value as Partial<OrderStatusHistory>;

  return (
    isOrderStatus(
      entry.status
    ) &&
    typeof entry.date === "string"
  );
}

function isOrder(
  value: unknown
): value is Order {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const order =
    value as Partial<Order>;

  return (
    typeof order.id === "string" &&
    typeof order.trackingCode ===
      "string" &&

    isOrderCustomer(
      order.customer
    ) &&

    isShippingAddress(
      order.shippingAddress
    ) &&

    Array.isArray(
      order.items
    ) &&

    order.items.every(
      isOrderItem
    ) &&

    order.items.length > 0 &&

    typeof order.subtotal ===
      "number" &&

    Number.isFinite(
      order.subtotal
    ) &&

    typeof order.shippingCost ===
      "number" &&

    Number.isFinite(
      order.shippingCost
    ) &&

    typeof order.total ===
      "number" &&

    Number.isFinite(
      order.total
    ) &&

    isCurrency(
      order.currency
    ) &&

    isOrderStatus(
      order.status
    ) &&

    Array.isArray(
      order.statusHistory
    ) &&

    order.statusHistory.every(
      isStatusHistoryEntry
    ) &&

    typeof order.createdAt ===
      "string" &&

    typeof order.updatedAt ===
      "string"
  );
}

/*
 * =============================================================
 * RESPONSE HELPERS
 * =============================================================
 */

async function readJsonResponse(
  response: Response
): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getApiErrorMessage(
  data: unknown,
  fallback: string
) {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (
      data as {
        message?: unknown;
      }
    ).message === "string"
  ) {
    return (
      data as {
        message: string;
      }
    ).message;
  }

  return fallback;
}

/*
 * =============================================================
 * PROVIDER
 * =============================================================
 */

export function OrderProvider({
  children,
}: OrderProviderProps) {
  const [
    orders,
    setOrders,
  ] = useState<Order[]>([]);

  const [
    isLoaded,
    setIsLoaded,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  /*
   * ===========================================================
   * REFRESH ORDERS
   *
   * GET /api/orders
   *
   * Admin ekranı ve context'in genel sipariş listesi
   * PostgreSQL'den buradan yüklenir.
   * ===========================================================
   */

  const refreshOrders =
    useCallback(
      async () => {
        setIsLoading(true);
        setError(null);

        try {
          const response =
            await fetch(
              "/api/orders",
              {
                method: "GET",

                cache:
                  "no-store",

                credentials:
                  "same-origin",
              }
            );

          const data =
            (await readJsonResponse(
              response
            )) as
              | OrdersApiResponse
              | null;

          if (
            !response.ok ||
            !data?.success
          ) {
            throw new Error(
              getApiErrorMessage(
                data,
                "Siparişler alınamadı."
              )
            );
          }

          const receivedOrders =
            Array.isArray(
              data.orders
            )
              ? data.orders.filter(
                  isOrder
                )
              : [];

          setOrders(
            receivedOrders
          );
        } catch (requestError) {
          console.error(
            "Siparişler alınamadı:",
            requestError
          );

          setOrders([]);

          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "Siparişler alınamadı."
          );
        } finally {
          setIsLoading(false);
          setIsLoaded(true);
        }
      },
      []
    );

  /*
   * Provider açıldığında siparişleri PostgreSQL'den al.
   */

  useEffect(() => {
    void refreshOrders();
  }, [refreshOrders]);

  /*
   * ===========================================================
   * CREATE ORDER
   *
   * POST /api/orders
   *
   * Burada client fiyatlarına güvenilmiyor.
   * API gerçek fiyatı PostgreSQL'den hesaplıyor.
   * ===========================================================
   */

  const createOrder =
    useCallback(
      async (
        input: CreateOrderInput
      ): Promise<Order> => {
        setError(null);

        /*
         * API'nin ihtiyacı olan minimum item
         * bilgisini gönderiyoruz.
         *
         * name/image/unitPrice/subtotal gibi
         * bilgiler server tarafından DB'den alınır.
         */

        const payload = {
          customer:
            input.customer,

          shippingAddress:
            input.shippingAddress,

          items:
            input.items.map(
              (item) => ({
                productId:
                  item.productId,

                color:
                  item.color,

                quantity:
                  item.quantity,
              })
            ),

          /*
           * API bunlara güvenmiyor.
           * Mevcut frontend uyumluluğu için
           * şimdilik gönderiyoruz.
           */
          subtotal:
            input.subtotal,

          shippingCost:
            input.shippingCost ??
            0,

          currency:
            input.currency,
        };

        const response =
          await fetch(
            "/api/orders",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "same-origin",

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const data =
          (await readJsonResponse(
            response
          )) as
            | OrderApiResponse
            | null;

        if (
          !response.ok ||
          !data?.success ||
          !data.order
        ) {
          const message =
            getApiErrorMessage(
              data,
              "Sipariş oluşturulamadı."
            );

          setError(message);

          throw new Error(
            message
          );
        }

        if (
          !isOrder(
            data.order
          )
        ) {
          const message =
            "Sunucudan geçersiz sipariş verisi alındı.";

          setError(message);

          throw new Error(
            message
          );
        }

        const createdOrder =
          data.order;

        /*
         * Yeni siparişi context'e anında ekliyoruz.
         *
         * Böylece order-complete ekranına geçerken
         * tekrar tüm listeyi beklememiz gerekmez.
         */

        setOrders(
          (currentOrders) => {
            const withoutDuplicate =
              currentOrders.filter(
                (order) =>
                  order.id !==
                  createdOrder.id
              );

            return [
              createdOrder,
              ...withoutDuplicate,
            ];
          }
        );

        return createdOrder;
      },
      []
    );

  /*
   * ===========================================================
   * FIND ORDER FROM CURRENT STATE
   *
   * Senkron fonksiyonu koruyoruz.
   *
   * Mevcut componentlerin kırılmaması için
   * halen kullanılabilir.
   * ===========================================================
   */

  const findOrderByTrackingCode =
    useCallback(
      (
        trackingCode: string
      ) => {
        const normalizedCode =
          trackingCode
            .trim()
            .toUpperCase();

        if (
          !normalizedCode
        ) {
          return undefined;
        }

        return orders.find(
          (order) =>
            order.trackingCode
              .trim()
              .toUpperCase() ===
            normalizedCode
        );
      },
      [orders]
    );

  /*
   * ===========================================================
   * FETCH ORDER BY TRACKING CODE
   *
   * GET /api/orders/tracking/[trackingCode]
   *
   * Bu fonksiyon public sipariş takip ekranında
   * kullanılacak.
   * ===========================================================
   */

  const fetchOrderByTrackingCode =
    useCallback(
      async (
        trackingCode: string
      ): Promise<
        Order | undefined
      > => {
        const normalizedCode =
          trackingCode
            .trim()
            .toUpperCase();

        if (
          !normalizedCode
        ) {
          return undefined;
        }

        setError(null);

        const response =
          await fetch(
            `/api/orders/tracking/${encodeURIComponent(
              normalizedCode
            )}`,
            {
              method: "GET",

              cache:
                "no-store",

              credentials:
                "same-origin",
            }
          );

        /*
         * Takip kodu bulunamadıysa bunu
         * uygulama hatası olarak değil,
         * "sipariş bulunamadı" sonucu olarak
         * değerlendiriyoruz.
         */

        if (
          response.status ===
          404
        ) {
          return undefined;
        }

        const data =
          (await readJsonResponse(
            response
          )) as
            | OrderApiResponse
            | null;

        if (
          !response.ok ||
          !data?.success ||
          !data.order
        ) {
          const message =
            getApiErrorMessage(
              data,
              "Sipariş bilgisi alınamadı."
            );

          setError(message);

          throw new Error(
            message
          );
        }

        if (
          !isOrder(
            data.order
          )
        ) {
          const message =
            "Sunucudan geçersiz sipariş verisi alındı.";

          setError(message);

          throw new Error(
            message
          );
        }

        const fetchedOrder =
          data.order;

        /*
         * Gelen siparişi context state'e de yaz.
         */

        setOrders(
          (currentOrders) => {
            const existingIndex =
              currentOrders.findIndex(
                (order) =>
                  order.id ===
                  fetchedOrder.id
              );

            if (
              existingIndex ===
              -1
            ) {
              return [
                fetchedOrder,
                ...currentOrders,
              ];
            }

            return currentOrders.map(
              (order) =>
                order.id ===
                fetchedOrder.id
                  ? fetchedOrder
                  : order
            );
          }
        );

        return fetchedOrder;
      },
      []
    );

  /*
   * ===========================================================
   * UPDATE ORDER STATUS
   *
   * PATCH /api/orders/[orderId]
   *
   * Admin tarafından kullanılır.
   * ===========================================================
   */

  const updateOrderStatus =
    useCallback(
      async (
        orderId: string,
        status: OrderStatus
      ): Promise<Order> => {
        const normalizedOrderId =
          orderId.trim();

        if (
          !normalizedOrderId
        ) {
          throw new Error(
            "Sipariş kimliği geçersiz."
          );
        }

        if (
          !isOrderStatus(
            status
          )
        ) {
          throw new Error(
            "Sipariş durumu geçersiz."
          );
        }

        setError(null);

        const response =
          await fetch(
            `/api/orders/${encodeURIComponent(
              normalizedOrderId
            )}`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "same-origin",

              body:
                JSON.stringify({
                  status,
                }),
            }
          );

        const data =
          (await readJsonResponse(
            response
          )) as
            | OrderApiResponse
            | null;

        if (
          !response.ok ||
          !data?.success ||
          !data.order
        ) {
          const message =
            getApiErrorMessage(
              data,
              "Sipariş durumu güncellenemedi."
            );

          setError(message);

          throw new Error(
            message
          );
        }

        if (
          !isOrder(
            data.order
          )
        ) {
          const message =
            "Sunucudan geçersiz sipariş verisi alındı.";

          setError(message);

          throw new Error(
            message
          );
        }

        const updatedOrder =
          data.order;

        /*
         * PostgreSQL'den dönen gerçek güncel
         * sipariş ile state'i değiştiriyoruz.
         */

        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) =>
                order.id ===
                updatedOrder.id
                  ? updatedOrder
                  : order
            )
        );

        return updatedOrder;
      },
      []
    );

  /*
   * ===========================================================
   * CONTEXT VALUE
   * ===========================================================
   */

  const value =
    useMemo<OrderContextValue>(
      () => ({
        orders,

        isLoaded,

        isLoading,

        error,

        refreshOrders,

        createOrder,

        findOrderByTrackingCode,

        fetchOrderByTrackingCode,

        updateOrderStatus,
      }),
      [
        orders,
        isLoaded,
        isLoading,
        error,
        refreshOrders,
        createOrder,
        findOrderByTrackingCode,
        fetchOrderByTrackingCode,
        updateOrderStatus,
      ]
    );

  return (
    <OrderContext.Provider
      value={value}
    >
      {children}
    </OrderContext.Provider>
  );
}

/*
 * =============================================================
 * HOOK
 * =============================================================
 */

export function useOrders() {
  const context =
    useContext(
      OrderContext
    );

  if (!context) {
    throw new Error(
      "useOrders, OrderProvider içerisinde kullanılmalıdır."
    );
  }

  return context;
}