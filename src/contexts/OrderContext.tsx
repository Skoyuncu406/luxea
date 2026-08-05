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
  currency: string;
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
  currency: string;

  status: OrderStatus;
  statusHistory: OrderStatusHistory[];

  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  customer: OrderCustomer;
  shippingAddress: OrderShippingAddress;
  items: OrderItem[];

  subtotal: number;
  shippingCost?: number;
  currency: string;
};

type OrderContextValue = {
  orders: Order[];
  isLoaded: boolean;

  createOrder: (
    input: CreateOrderInput
  ) => Order;

  findOrderByTrackingCode: (
    trackingCode: string
  ) => Order | undefined;

  updateOrderStatus: (
    orderId: string,
    status: OrderStatus
  ) => void;
};

type OrderProviderProps = {
  children: ReactNode;
};

const ORDERS_STORAGE_KEY = "luxea-orders";

const VALID_ORDER_STATUSES: OrderStatus[] = [
  "received",
  "payment-confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

const OrderContext =
  createContext<OrderContextValue | null>(null);

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

function createRandomSegment(
  length: number
) {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  if (
    typeof window !== "undefined" &&
    window.crypto?.getRandomValues
  ) {
    const randomValues =
      new Uint32Array(length);

    window.crypto.getRandomValues(
      randomValues
    );

    return Array.from(randomValues)
      .map(
        (value) =>
          characters[
            value % characters.length
          ]
      )
      .join("");
  }

  return Array.from(
    { length },
    () =>
      characters[
        Math.floor(
          Math.random() *
            characters.length
        )
      ]
  ).join("");
}

function createTrackingCode() {
  const year =
    new Date().getFullYear();

  return `LUX-${year}-${createRandomSegment(
    8
  )}`;
}

function createUniqueTrackingCode(
  existingOrders: Order[]
) {
  let trackingCode =
    createTrackingCode();

  while (
    existingOrders.some(
      (order) =>
        order.trackingCode ===
        trackingCode
    )
  ) {
    trackingCode =
      createTrackingCode();
  }

  return trackingCode;
}

function createOrderId() {
  if (
    typeof window !== "undefined" &&
    window.crypto?.randomUUID
  ) {
    return window.crypto.randomUUID();
  }

  return `order-${Date.now()}-${createRandomSegment(
    10
  )}`;
}

function isValidOrderItem(
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

  return (
    typeof item.id === "string" &&
    typeof item.productId === "string" &&
    typeof item.slug === "string" &&
    typeof item.image === "string" &&
    typeof item.color === "string" &&
    typeof item.quantity === "number" &&
    Number.isFinite(item.quantity) &&
    item.quantity > 0 &&
    typeof item.unitPrice === "number" &&
    Number.isFinite(item.unitPrice) &&
    item.unitPrice >= 0 &&
    typeof item.currency === "string" &&
    typeof item.name === "object" &&
    item.name !== null &&
    typeof item.name.tr === "string" &&
    typeof item.name.en === "string" &&
    typeof item.name.ar === "string"
  );
}

function normalizeStoredOrder(
  value: unknown
): Order | null {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return null;
  }

  const order =
    value as Partial<Order>;

  if (
    typeof order.id !== "string" ||
    typeof order.trackingCode !==
      "string" ||
    !isOrderStatus(order.status) ||
    typeof order.createdAt !==
      "string" ||
    typeof order.updatedAt !==
      "string" ||
    !Array.isArray(order.items)
  ) {
    return null;
  }

  const validItems =
    order.items.filter(
      isValidOrderItem
    );

  if (
    validItems.length !==
    order.items.length
  ) {
    return null;
  }

  if (
    typeof order.customer !==
      "object" ||
    order.customer === null ||
    typeof order.customer.email !==
      "string" ||
    typeof order.customer.firstName !==
      "string" ||
    typeof order.customer.lastName !==
      "string" ||
    typeof order.customer.phone !==
      "string"
  ) {
    return null;
  }

  if (
    typeof order.shippingAddress !==
      "object" ||
    order.shippingAddress === null ||
    typeof order.shippingAddress
      .country !== "string" ||
    typeof order.shippingAddress
      .address !== "string" ||
    typeof order.shippingAddress
      .city !== "string" ||
    typeof order.shippingAddress
      .postalCode !== "string"
  ) {
    return null;
  }

  const subtotal =
    typeof order.subtotal === "number"
      ? order.subtotal
      : 0;

  const shippingCost =
    typeof order.shippingCost ===
    "number"
      ? order.shippingCost
      : 0;

  const total =
    typeof order.total === "number"
      ? order.total
      : subtotal + shippingCost;

  const currency =
    typeof order.currency ===
      "string" &&
    order.currency.trim()
      ? order.currency
      : validItems[0]?.currency ??
        "USD";

  const statusHistory =
    Array.isArray(
      order.statusHistory
    )
      ? order.statusHistory.filter(
          (
            entry
          ): entry is OrderStatusHistory =>
            typeof entry ===
              "object" &&
            entry !== null &&
            isOrderStatus(
              (
                entry as Partial<OrderStatusHistory>
              ).status
            ) &&
            typeof (
              entry as Partial<OrderStatusHistory>
            ).date === "string"
        )
      : [];

  return {
    id: order.id,
    trackingCode:
      order.trackingCode,

    customer:
      order.customer as OrderCustomer,

    shippingAddress:
      order.shippingAddress as OrderShippingAddress,

    items: validItems,

    subtotal,
    shippingCost,
    total,
    currency,

    status: order.status,
    statusHistory:
      statusHistory.length > 0
        ? statusHistory
        : [
            {
              status: order.status,
              date: order.createdAt,
            },
          ],

    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export function OrderProvider({
  children,
}: OrderProviderProps) {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [isLoaded, setIsLoaded] =
    useState(false);

  useEffect(() => {
    try {
      const storedOrders =
        window.localStorage.getItem(
          ORDERS_STORAGE_KEY
        );

      if (!storedOrders) {
        return;
      }

      const parsedOrders: unknown =
        JSON.parse(storedOrders);

      if (
        !Array.isArray(parsedOrders)
      ) {
        return;
      }

      const validOrders =
        parsedOrders
          .map(normalizeStoredOrder)
          .filter(
            (
              order
            ): order is Order =>
              order !== null
          );

      setOrders(validOrders);
    } catch (error) {
      console.error(
        "Siparişler yüklenemedi:",
        error
      );

      setOrders([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        ORDERS_STORAGE_KEY,
        JSON.stringify(orders)
      );
    } catch (error) {
      console.error(
        "Siparişler kaydedilemedi:",
        error
      );
    }
  }, [orders, isLoaded]);

  const createOrder = useCallback(
    (
      input: CreateOrderInput
    ): Order => {
      const now =
        new Date().toISOString();

      const shippingCost =
        Math.max(
          0,
          input.shippingCost ?? 0
        );

      const trackingCode =
        createUniqueTrackingCode(
          orders
        );

      const newOrder: Order = {
        id: createOrderId(),
        trackingCode,

        customer: input.customer,
        shippingAddress:
          input.shippingAddress,

        items: input.items,

        subtotal: input.subtotal,
        shippingCost,
        total:
          input.subtotal +
          shippingCost,

        currency:
          input.currency || "USD",

        status: "received",

        statusHistory: [
          {
            status: "received",
            date: now,
          },
        ],

        createdAt: now,
        updatedAt: now,
      };

      setOrders(
        (currentOrders) => [
          newOrder,
          ...currentOrders,
        ]
      );

      return newOrder;
    },
    [orders]
  );

  const findOrderByTrackingCode =
    useCallback(
      (
        trackingCode: string
      ) => {
        const normalizedCode =
          trackingCode
            .trim()
            .toUpperCase();

        if (!normalizedCode) {
          return undefined;
        }

        return orders.find(
          (order) =>
            order.trackingCode.toUpperCase() ===
            normalizedCode
        );
      },
      [orders]
    );

  const updateOrderStatus =
    useCallback(
      (
        orderId: string,
        status: OrderStatus
      ) => {
        const now =
          new Date().toISOString();

        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) => {
                if (
                  order.id !== orderId ||
                  order.status ===
                    status
                ) {
                  return order;
                }

                const alreadyExists =
                  order.statusHistory.some(
                    (entry) =>
                      entry.status ===
                      status
                  );

                return {
                  ...order,

                  status,
                  updatedAt: now,

                  statusHistory:
                    alreadyExists
                      ? order.statusHistory
                      : [
                          ...order.statusHistory,
                          {
                            status,
                            date: now,
                          },
                        ],
                };
              }
            )
        );
      },
      []
    );

  const value =
    useMemo<OrderContextValue>(
      () => ({
        orders,
        isLoaded,
        createOrder,
        findOrderByTrackingCode,
        updateOrderStatus,
      }),
      [
        orders,
        isLoaded,
        createOrder,
        findOrderByTrackingCode,
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

export function useOrders() {
  const context =
    useContext(OrderContext);

  if (!context) {
    throw new Error(
      "useOrders, OrderProvider içerisinde kullanılmalıdır."
    );
  }

  return context;
}