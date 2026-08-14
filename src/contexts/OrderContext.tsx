"use client";

import {
  createContext,
  useCallback,
  useContext,
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

/*
 * Public / admin tarafında kullanılan yeni durum akışı.
 *
 * PAYMENT_CONFIRMED artık kullanıcı ve yönetici akışında
 * gösterilmez.
 *
 * Eski veritabanı kayıtlarında bulunabilen
 * "payment-confirmed" değeri aşağıdaki normalize yardımcıları
 * tarafından "received" olarak ele alınır.
 */
export type OrderStatus =
  | "received"
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

  customer:
    OrderCustomer;

  shippingAddress:
    OrderShippingAddress;

  items: OrderItem[];

  /*
   * Bu alanlar artık public arayüzde gösterilmek zorunda değil.
   * Ancak mevcut backend/order snapshot yapısıyla uyumluluk için
   * context içerisinde korunuyor.
   */
  subtotal: number;
  shippingCost: number;
  total: number;

  currency: Currency;

  status: OrderStatus;

  statusHistory:
    OrderStatusHistory[];

  createdAt: string;
  updatedAt: string;
};

/*
 * Mevcut checkout / sipariş-talebi akışını kırmamak için
 * mevcut input şekli korunur.
 *
 * Server gerçek ürün ve fiyat bilgilerini PostgreSQL'den
 * doğrulamaya devam eder.
 */
export type CreateOrderInput = {
  customer:
    OrderCustomer;

  shippingAddress:
    OrderShippingAddress;

  items:
    OrderItem[];

  subtotal: number;

  shippingCost?: number;

  currency:
    Currency;
};

/*
 * =============================================================
 * API RESPONSE TYPES
 * =============================================================
 */

type OrdersApiResponse = {
  success: boolean;

  orders?: unknown[];

  message?: string;
};

type OrderApiResponse = {
  success: boolean;

  order?: unknown;

  message?: string;
};

type DeleteOrderApiResponse = {
  success: boolean;

  orderId?: string;

  trackingCode?: string;

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

  error:
    | string
    | null;

  refreshOrders:
    () => Promise<void>;

  createOrder: (
    input:
      CreateOrderInput
  ) => Promise<Order>;

  findOrderByTrackingCode: (
    trackingCode: string
  ) =>
    | Order
    | undefined;

  fetchOrderByTrackingCode: (
    trackingCode: string
  ) => Promise<
    | Order
    | undefined
  >;

  updateOrderStatus: (
    orderId: string,
    status: OrderStatus
  ) => Promise<Order>;

  deleteOrder: (
    orderId: string
  ) => Promise<void>;
};

type OrderProviderProps = {
  children:
    ReactNode;
};

const OrderContext =
  createContext<
    OrderContextValue | null
  >(
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
 * GENERIC HELPERS
 * =============================================================
 */

function isRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null
  );
}

function isCurrency(
  value: unknown
): value is Currency {
  return (
    typeof value ===
      "string" &&
    SUPPORTED_CURRENCIES.includes(
      value as Currency
    )
  );
}

/*
 * =============================================================
 * STATUS NORMALIZATION
 * =============================================================
 *
 * Legacy:
 *
 * "payment-confirmed"
 *
 * Yeni sistemde bağımsız bir aşama değildir.
 * Eski siparişler hata vermesin diye "received" olarak
 * normalize edilir.
 * =============================================================
 */

function normalizeOrderStatus(
  value: unknown
):
  | OrderStatus
  | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  if (
    value ===
    "payment-confirmed"
  ) {
    return "received";
  }

  if (
    VALID_ORDER_STATUSES.includes(
      value as OrderStatus
    )
  ) {
    return value as OrderStatus;
  }

  return null;
}

/*
 * =============================================================
 * ORDER ITEM PARSER
 * =============================================================
 */

function parseOrderItem(
  value: unknown
):
  | OrderItem
  | null {
  if (
    !isRecord(
      value
    )
  ) {
    return null;
  }

  const name =
    value.name;

  if (
    !isRecord(
      name
    )
  ) {
    return null;
  }

  if (
    typeof value.id !==
      "string" ||
    typeof value.productId !==
      "string" ||
    typeof value.slug !==
      "string" ||
    typeof value.image !==
      "string" ||
    typeof value.color !==
      "string" ||
    typeof value.quantity !==
      "number" ||
    !Number.isInteger(
      value.quantity
    ) ||
    value.quantity <= 0 ||
    typeof value.unitPrice !==
      "number" ||
    !Number.isFinite(
      value.unitPrice
    ) ||
    value.unitPrice < 0 ||
    !isCurrency(
      value.currency
    ) ||
    typeof name.tr !==
      "string" ||
    typeof name.en !==
      "string" ||
    typeof name.ar !==
      "string"
  ) {
    return null;
  }

  return {
    id:
      value.id,

    productId:
      value.productId,

    slug:
      value.slug,

    name: {
      tr:
        name.tr,

      en:
        name.en,

      ar:
        name.ar,
    },

    image:
      value.image,

    color:
      value.color,

    quantity:
      value.quantity,

    unitPrice:
      value.unitPrice,

    currency:
      value.currency,
  };
}

/*
 * =============================================================
 * CUSTOMER PARSER
 * =============================================================
 */

function parseOrderCustomer(
  value: unknown
):
  | OrderCustomer
  | null {
  if (
    !isRecord(
      value
    )
  ) {
    return null;
  }

  if (
    typeof value.email !==
      "string" ||
    typeof value.firstName !==
      "string" ||
    typeof value.lastName !==
      "string" ||
    typeof value.phone !==
      "string"
  ) {
    return null;
  }

  return {
    email:
      value.email,

    firstName:
      value.firstName,

    lastName:
      value.lastName,

    phone:
      value.phone,
  };
}

/*
 * =============================================================
 * SHIPPING ADDRESS PARSER
 * =============================================================
 */

function parseShippingAddress(
  value: unknown
):
  | OrderShippingAddress
  | null {
  if (
    !isRecord(
      value
    )
  ) {
    return null;
  }

  if (
    typeof value.country !==
      "string" ||
    typeof value.address !==
      "string" ||
    typeof value.city !==
      "string" ||
    typeof value.postalCode !==
      "string"
  ) {
    return null;
  }

  if (
    value.addressLineTwo !==
      undefined &&
    typeof value.addressLineTwo !==
      "string"
  ) {
    return null;
  }

  if (
    value.state !==
      undefined &&
    typeof value.state !==
      "string"
  ) {
    return null;
  }

  return {
    country:
      value.country,

    address:
      value.address,

    addressLineTwo:
      typeof value.addressLineTwo ===
      "string"
        ? value.addressLineTwo
        : undefined,

    city:
      value.city,

    state:
      typeof value.state ===
      "string"
        ? value.state
        : undefined,

    postalCode:
      value.postalCode,
  };
}

/*
 * =============================================================
 * STATUS HISTORY PARSER
 * =============================================================
 */

function parseStatusHistory(
  value: unknown
): OrderStatusHistory[] {
  if (
    !Array.isArray(
      value
    )
  ) {
    return [];
  }

  const parsed:
    OrderStatusHistory[] =
    [];

  for (
    const entry of value
  ) {
    if (
      !isRecord(
        entry
      )
    ) {
      continue;
    }

    const status =
      normalizeOrderStatus(
        entry.status
      );

    if (
      !status ||
      typeof entry.date !==
        "string"
    ) {
      continue;
    }

    /*
     * Legacy payment-confirmed -> received dönüşümünde
     * art arda aynı public durum oluşabilir.
     *
     * Timeline'da gereksiz tekrar göstermemek için
     * aynı statüden oluşan ardışık kayıtları tekilleştiriyoruz.
     */
    const previous =
      parsed[
        parsed.length - 1
      ];

    if (
      previous &&
      previous.status ===
        status
    ) {
      /*
       * En güncel tarihi tut.
       */
      parsed[
        parsed.length - 1
      ] = {
        status,
        date:
          entry.date,
      };

      continue;
    }

    parsed.push({
      status,
      date:
        entry.date,
    });
  }

  return parsed;
}

/*
 * =============================================================
 * ORDER PARSER
 * =============================================================
 */

function parseOrder(
  value: unknown
):
  | Order
  | null {
  if (
    !isRecord(
      value
    )
  ) {
    return null;
  }

  const customer =
    parseOrderCustomer(
      value.customer
    );

  const shippingAddress =
    parseShippingAddress(
      value.shippingAddress
    );

  const status =
    normalizeOrderStatus(
      value.status
    );

  if (
    !customer ||
    !shippingAddress ||
    !status
  ) {
    return null;
  }

  if (
    !Array.isArray(
      value.items
    )
  ) {
    return null;
  }

  const items =
    value.items
      .map(
        parseOrderItem
      )
      .filter(
        (
          item
        ): item is OrderItem =>
          item !== null
      );

  if (
    items.length ===
      0 ||
    items.length !==
      value.items.length
  ) {
    return null;
  }

  if (
    typeof value.id !==
      "string" ||
    typeof value.trackingCode !==
      "string" ||
    typeof value.subtotal !==
      "number" ||
    !Number.isFinite(
      value.subtotal
    ) ||
    typeof value.shippingCost !==
      "number" ||
    !Number.isFinite(
      value.shippingCost
    ) ||
    typeof value.total !==
      "number" ||
    !Number.isFinite(
      value.total
    ) ||
    !isCurrency(
      value.currency
    ) ||
    typeof value.createdAt !==
      "string" ||
    typeof value.updatedAt !==
      "string"
  ) {
    return null;
  }

  const statusHistory =
    parseStatusHistory(
      value.statusHistory
    );

  /*
   * Eski / eksik bir kayıtta history boş gelirse
   * mevcut status'u en az bir timeline kaydı olarak koru.
   */
  const normalizedHistory =
    statusHistory.length > 0
      ? statusHistory
      : [
          {
            status,
            date:
              value.createdAt,
          },
        ];

  return {
    id:
      value.id,

    trackingCode:
      value.trackingCode,

    customer,

    shippingAddress,

    items,

    subtotal:
      value.subtotal,

    shippingCost:
      value.shippingCost,

    total:
      value.total,

    currency:
      value.currency,

    status,

    statusHistory:
      normalizedHistory,

    createdAt:
      value.createdAt,

    updatedAt:
      value.updatedAt,
  };
}

/*
 * =============================================================
 * RESPONSE HELPERS
 * =============================================================
 */

async function readJsonResponse(
  response:
    Response
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
    isRecord(
      data
    ) &&
    typeof data.message ===
      "string"
  ) {
    return data.message;
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
  ] = useState<Order[]>(
    []
  );

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
  ] = useState<
    string | null
  >(
    null
  );

  /*
   * ===========================================================
   * REFRESH ORDERS
   * ===========================================================
   *
   * GET /api/orders
   *
   * Admin genel sipariş listesi PostgreSQL'den gelir.
   * ===========================================================
   */

  const refreshOrders =
    useCallback(
      async () => {
        setIsLoading(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await fetch(
              "/api/orders",
              {
                method:
                  "GET",

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
              ? data.orders
                  .map(
                    parseOrder
                  )
                  .filter(
                    (
                      order
                    ): order is Order =>
                      order !==
                      null
                  )
              : [];

          setOrders(
            receivedOrders
          );
        } catch (
          requestError
        ) {
          console.error(
            "Siparişler alınamadı:",
            requestError
          );

          setOrders(
            []
          );

          setError(
            requestError instanceof
            Error
              ? requestError.message
              : "Siparişler alınamadı."
          );
        } finally {
          setIsLoading(
            false
          );

          setIsLoaded(
            true
          );
        }
      },
      []
    );

  /*
   * ===========================================================
   * CREATE ORDER
   * ===========================================================
   *
   * POST /api/orders
   *
   * Kullanıcı giriş yapmışsa backend siparişi session userId
   * ile hesaba bağlar.
   *
   * Guest sipariş talebi de desteklenir.
   * ===========================================================
   */

  const createOrder =
    useCallback(
      async (
        input:
          CreateOrderInput
      ): Promise<Order> => {
        setError(
          null
        );

        const payload = {
          customer:
            input.customer,

          shippingAddress:
            input.shippingAddress,

          items:
            input.items.map(
              (
                item
              ) => ({
                productId:
                  item.productId,

                color:
                  item.color,

                quantity:
                  item.quantity,
              })
            ),

          /*
           * Server gerçek ürün fiyatlarını DB'den doğrular.
           * Mevcut API kontratıyla uyumluluk için gönderilmeye
           * devam eder.
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
              method:
                "POST",

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

          setError(
            message
          );

          throw new Error(
            message
          );
        }

        const createdOrder =
          parseOrder(
            data.order
          );

        if (
          !createdOrder
        ) {
          const message =
            "Sunucudan geçersiz sipariş verisi alındı.";

          setError(
            message
          );

          throw new Error(
            message
          );
        }

        setOrders(
          (
            currentOrders
          ) => {
            const withoutDuplicate =
              currentOrders.filter(
                (
                  order
                ) =>
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
   * ===========================================================
   */

  const findOrderByTrackingCode =
    useCallback(
      (
        trackingCode:
          string
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
          (
            order
          ) =>
            order
              .trackingCode
              .trim()
              .toUpperCase() ===
            normalizedCode
        );
      },
      [
        orders,
      ]
    );

  /*
   * ===========================================================
   * FETCH ORDER BY TRACKING CODE
   * ===========================================================
   *
   * GET /api/orders/tracking/[trackingCode]
   * ===========================================================
   */

  const fetchOrderByTrackingCode =
    useCallback(
      async (
        trackingCode:
          string
      ): Promise<
        | Order
        | undefined
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

        setError(
          null
        );

        const response =
          await fetch(
            `/api/orders/tracking/${encodeURIComponent(
              normalizedCode
            )}`,
            {
              method:
                "GET",

              cache:
                "no-store",

              credentials:
                "same-origin",
            }
          );

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

          setError(
            message
          );

          throw new Error(
            message
          );
        }

        const fetchedOrder =
          parseOrder(
            data.order
          );

        if (
          !fetchedOrder
        ) {
          const message =
            "Sunucudan geçersiz sipariş verisi alındı.";

          setError(
            message
          );

          throw new Error(
            message
          );
        }

        setOrders(
          (
            currentOrders
          ) => {
            const exists =
              currentOrders.some(
                (
                  order
                ) =>
                  order.id ===
                  fetchedOrder.id
              );

            if (
              !exists
            ) {
              return [
                fetchedOrder,
                ...currentOrders,
              ];
            }

            return currentOrders.map(
              (
                order
              ) =>
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
   * ===========================================================
   *
   * PATCH /api/orders/[orderId]
   *
   * Yalnızca yeni public/admin durumları gönderilir:
   *
   * received
   * preparing
   * shipped
   * delivered
   * cancelled
   * ===========================================================
   */

  const updateOrderStatus =
    useCallback(
      async (
        orderId:
          string,
        status:
          OrderStatus
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
          !VALID_ORDER_STATUSES.includes(
            status
          )
        ) {
          throw new Error(
            "Sipariş durumu geçersiz."
          );
        }

        setError(
          null
        );

        const response =
          await fetch(
            `/api/orders/${encodeURIComponent(
              normalizedOrderId
            )}`,
            {
              method:
                "PATCH",

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

          setError(
            message
          );

          throw new Error(
            message
          );
        }

        const updatedOrder =
          parseOrder(
            data.order
          );

        if (
          !updatedOrder
        ) {
          const message =
            "Sunucudan geçersiz sipariş verisi alındı.";

          setError(
            message
          );

          throw new Error(
            message
          );
        }

        setOrders(
          (
            currentOrders
          ) =>
            currentOrders.map(
              (
                order
              ) =>
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
   * DELETE ORDER
   * ===========================================================
   *
   * DELETE /api/orders/[orderId]
   *
   * Backend yalnızca:
   *
   * delivered
   * cancelled
   *
   * durumundaki siparişlerin silinmesine izin verir.
   * Başarılı silme sonrasında sipariş local state'ten de
   * kaldırılır; böylece admin listesi anında güncellenir.
   * ===========================================================
   */

  const deleteOrder =
    useCallback(
      async (
        orderId:
          string
      ): Promise<void> => {
        const normalizedOrderId =
          orderId.trim();

        if (
          !normalizedOrderId
        ) {
          throw new Error(
            "Sipariş kimliği geçersiz."
          );
        }

        setError(
          null
        );

        const response =
          await fetch(
            `/api/orders/${encodeURIComponent(
              normalizedOrderId
            )}`,
            {
              method:
                "DELETE",

              credentials:
                "same-origin",
            }
          );

        const data =
          (await readJsonResponse(
            response
          )) as
            | DeleteOrderApiResponse
            | null;

        if (
          !response.ok ||
          !data?.success
        ) {
          const message =
            getApiErrorMessage(
              data,
              "Sipariş silinemedi."
            );

          setError(
            message
          );

          throw new Error(
            message
          );
        }

        setOrders(
          (
            currentOrders
          ) =>
            currentOrders.filter(
              (
                order
              ) =>
                order.id !==
                normalizedOrderId
            )
        );
      },
      []
    );

  /*
   * ===========================================================
   * CONTEXT VALUE
   * ===========================================================
   */

  const value =
    useMemo<
      OrderContextValue
    >(
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

        deleteOrder,
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
        deleteOrder,
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

  if (
    !context
  ) {
    throw new Error(
      "useOrders, OrderProvider içerisinde kullanılmalıdır."
    );
  }

  return context;
}