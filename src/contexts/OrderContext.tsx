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

export type Currency = "EUR" | "USD" | "GBP";

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

export type CreateOrderInput = {
  customer: OrderCustomer;
  shippingAddress: OrderShippingAddress;
  items: OrderItem[];

  subtotal: number;
  shippingCost?: number;
  currency: Currency;
};

type OrderContextValue = {
  orders: Order[];
  isLoaded: boolean;

  createOrder: (input: CreateOrderInput) => Order;

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

const SUPPORTED_CURRENCIES: Currency[] = [
  "EUR",
  "USD",
  "GBP",
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

function createRandomSegment(length: number) {
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
  const year = new Date().getFullYear();

  return `LUX-${year}-${createRandomSegment(
    8
  )}`;
}

function createUniqueTrackingCode(
  existingOrders: Order[]
) {
  let trackingCode = createTrackingCode();

  while (
    existingOrders.some(
      (order) =>
        order.trackingCode === trackingCode
    )
  ) {
    trackingCode = createTrackingCode();
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

  const item = value as Partial<OrderItem>;

  return (
    typeof item.id === "string" &&
    typeof item.productId === "string" &&
    typeof item.slug === "string" &&
    typeof item.image === "string" &&
    typeof item.color === "string" &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    typeof item.unitPrice === "number" &&
    Number.isFinite(item.unitPrice) &&
    item.unitPrice >= 0 &&
    isCurrency(item.currency) &&
    typeof item.name === "object" &&
    item.name !== null &&
    typeof item.name.tr === "string" &&
    typeof item.name.en === "string" &&
    typeof item.name.ar === "string"
  );
}

function isValidOrderCustomer(
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
    typeof customer.email === "string" &&
    typeof customer.firstName ===
      "string" &&
    typeof customer.lastName ===
      "string" &&
    typeof customer.phone === "string"
  );
}

function isValidShippingAddress(
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
    typeof address.country === "string" &&
    typeof address.address === "string" &&
    typeof address.city === "string" &&
    typeof address.postalCode === "string" &&
    (address.addressLineTwo === undefined ||
      typeof address.addressLineTwo ===
        "string") &&
    (address.state === undefined ||
      typeof address.state === "string")
  );
}

function isValidStatusHistoryEntry(
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
    isOrderStatus(entry.status) &&
    typeof entry.date === "string"
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

  const order = value as Partial<Order>;

  if (
    typeof order.id !== "string" ||
    typeof order.trackingCode !==
      "string" ||
    !isOrderStatus(order.status) ||
    typeof order.createdAt !==
      "string" ||
    typeof order.updatedAt !==
      "string" ||
    !Array.isArray(order.items) ||
    !isValidOrderCustomer(
      order.customer
    ) ||
    !isValidShippingAddress(
      order.shippingAddress
    )
  ) {
    return null;
  }

  const validItems =
    order.items.filter(isValidOrderItem);

  if (
    validItems.length !==
      order.items.length ||
    validItems.length === 0
  ) {
    return null;
  }

  const subtotal =
    typeof order.subtotal === "number" &&
    Number.isFinite(order.subtotal)
      ? order.subtotal
      : validItems.reduce(
          (total, item) =>
            total +
            item.unitPrice * item.quantity,
          0
        );

  const shippingCost =
    typeof order.shippingCost ===
      "number" &&
    Number.isFinite(order.shippingCost)
      ? Math.max(0, order.shippingCost)
      : 0;

  const total =
    typeof order.total === "number" &&
    Number.isFinite(order.total)
      ? order.total
      : subtotal + shippingCost;

  const currency: Currency =
    isCurrency(order.currency)
      ? order.currency
      : validItems[0]?.currency ?? "USD";

  const statusHistory =
    Array.isArray(order.statusHistory)
      ? order.statusHistory.filter(
          isValidStatusHistoryEntry
        )
      : [];

  return {
    id: order.id,
    trackingCode: order.trackingCode,

    customer: order.customer,
    shippingAddress:
      order.shippingAddress,
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

      if (!Array.isArray(parsedOrders)) {
        return;
      }

      const validOrders = parsedOrders
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
    (input: CreateOrderInput): Order => {
      const now =
        new Date().toISOString();

      const shippingCost = Math.max(
        0,
        input.shippingCost ?? 0
      );

      const subtotal = Math.max(
        0,
        input.subtotal
      );

      const trackingCode =
        createUniqueTrackingCode(orders);

      const newOrder: Order = {
        id: createOrderId(),
        trackingCode,

        customer: input.customer,
        shippingAddress:
          input.shippingAddress,
        items: input.items,

        subtotal,
        shippingCost,
        total: subtotal + shippingCost,
        currency: input.currency,

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

      setOrders((currentOrders) => [
        newOrder,
        ...currentOrders,
      ]);

      return newOrder;
    },
    [orders]
  );

  const findOrderByTrackingCode =
    useCallback(
      (trackingCode: string) => {
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

        setOrders((currentOrders) =>
          currentOrders.map((order) => {
            if (
              order.id !== orderId ||
              order.status === status
            ) {
              return order;
            }

            const statusAlreadyExists =
              order.statusHistory.some(
                (entry) =>
                  entry.status === status
              );

            return {
              ...order,
              status,
              updatedAt: now,

              statusHistory:
                statusAlreadyExists
                  ? order.statusHistory
                  : [
                      ...order.statusHistory,
                      {
                        status,
                        date: now,
                      },
                    ],
            };
          })
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
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error(
      "useOrders, OrderProvider içerisinde kullanılmalıdır."
    );
  }

  return context;
}