import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import {
  Currency,
  OrderStatus,
  PaymentStatus,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

/*
 * =============================================================
 * REQUEST TYPES
 * =============================================================
 */

type CreateOrderRequestBody = {
  customer?: {
    email?: unknown;
    firstName?: unknown;
    lastName?: unknown;
    phone?: unknown;
  };

  shippingAddress?: {
    country?: unknown;
    address?: unknown;
    addressLineTwo?: unknown;
    city?: unknown;
    state?: unknown;
    postalCode?: unknown;
  };

  items?: unknown;

  /*
   * Bunlar client'tan gelebilir fakat
   * fiyat hesaplamasında KULLANILMAZ.
   */
  subtotal?: unknown;
  shippingCost?: unknown;
  currency?: unknown;
};

type RequestOrderItem = {
  productId: string;
  color: string;
  quantity: number;
};

/*
 * =============================================================
 * FRONTEND STATUS TYPE
 * =============================================================
 */

type FrontendOrderStatus =
  | "received"
  | "payment-confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

/*
 * =============================================================
 * HELPERS
 * =============================================================
 */

function isString(
  value: unknown
): value is string {
  return typeof value === "string";
}

function normalizeOptionalString(
  value: unknown
) {
  if (!isString(value)) {
    return undefined;
  }

  const normalized =
    value.trim();

  return normalized ||
    undefined;
}

function isPositiveInteger(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0
  );
}

function normalizeEmail(
  value: string
) {
  return value
    .trim()
    .toLowerCase();
}

function isValidEmail(
  value: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

/*
 * =============================================================
 * ORDER / TRACKING CODE
 * =============================================================
 */

function createCodeSegment() {
  return randomUUID()
    .replace(/-/g, "")
    .slice(0, 10)
    .toUpperCase();
}

function createOrderNumber() {
  const year =
    new Date().getUTCFullYear();

  return `ORD-${year}-${createCodeSegment()}`;
}

function createTrackingCode() {
  const year =
    new Date().getUTCFullYear();

  return `LUX-${year}-${createCodeSegment()}`;
}

/*
 * =============================================================
 * STATUS SERIALIZER
 * =============================================================
 */

function serializeStatus(
  status: OrderStatus
): FrontendOrderStatus {
  switch (status) {
    case OrderStatus.RECEIVED:
      return "received";

    case OrderStatus.PAYMENT_CONFIRMED:
      return "payment-confirmed";

    case OrderStatus.PREPARING:
      return "preparing";

    case OrderStatus.SHIPPED:
      return "shipped";

    case OrderStatus.DELIVERED:
      return "delivered";

    case OrderStatus.CANCELLED:
      return "cancelled";
  }
}

/*
 * =============================================================
 * ORDER QUERY
 * =============================================================
 */

async function getOrderById(
  orderId: string
) {
  return prisma.order.findUnique({
    where: {
      id: orderId,
    },

    include: {
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },

      statusHistory: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

type OrderWithRelations =
  Awaited<
    ReturnType<
      typeof getOrderById
    >
  >;

/*
 * =============================================================
 * SERIALIZER
 * =============================================================
 */

function serializeOrder(
  order:
    NonNullable<OrderWithRelations>
) {
  return {
    id: order.id,

    trackingCode:
      order.trackingCode,

    customer: {
      email:
        order.customerEmail,

      firstName:
        order.customerFirstName,

      lastName:
        order.customerLastName,

      phone:
        order.customerPhone,
    },

    shippingAddress: {
      country:
        order.shippingCountry,

      address:
        order.shippingAddress,

      addressLineTwo:
        order.shippingAddressLineTwo ||
        undefined,

      city:
        order.shippingCity,

      state:
        order.shippingState ||
        undefined,

      postalCode:
        order.shippingPostalCode,
    },

    items:
      order.items.map(
        (item) => ({
          id: item.id,

          productId:
            item.productId ?? "",

          slug:
            item.productSlug,

          name: {
            tr:
              item.productNameTr,

            en:
              item.productNameEn,

            ar:
              item.productNameAr,
          },

          image:
            item.imageUrl,

          color:
            item.color,

          quantity:
            item.quantity,

          unitPrice:
            Number(
              item.unitPrice
            ),

          currency:
            item.currency,
        })
      ),

    subtotal:
      Number(
        order.subtotal
      ),

    shippingCost:
      Number(
        order.shippingCost
      ),

    total:
      Number(
        order.total
      ),

    currency:
      order.currency,

    status:
      serializeStatus(
        order.status
      ),

    statusHistory:
      order.statusHistory.map(
        (entry) => ({
          status:
            serializeStatus(
              entry.status
            ),

          date:
            entry.createdAt.toISOString(),
        })
      ),

    createdAt:
      order.createdAt.toISOString(),

    updatedAt:
      order.updatedAt.toISOString(),
  };
}

/*
 * =============================================================
 * ITEM VALIDATION
 * =============================================================
 */

function normalizeOrderItems(
  value: unknown
):
  | RequestOrderItem[]
  | null {
  if (
    !Array.isArray(value) ||
    value.length === 0
  ) {
    return null;
  }

  const result:
    RequestOrderItem[] = [];

  for (const rawItem of value) {
    if (
      typeof rawItem !==
        "object" ||
      rawItem === null
    ) {
      return null;
    }

    const item =
      rawItem as {
        productId?: unknown;
        color?: unknown;
        quantity?: unknown;
      };

    const productId =
      isString(
        item.productId
      )
        ? item.productId.trim()
        : "";

    const color =
      isString(item.color)
        ? item.color.trim()
        : "";

    if (
      !productId ||
      !color ||
      !isPositiveInteger(
        item.quantity
      )
    ) {
      return null;
    }

    result.push({
      productId,

      color,

      quantity:
        item.quantity,
    });
  }

  return result;
}

/*
 * =============================================================
 * GET
 *
 * Admin sipariş listesi için.
 * =============================================================
 */

export async function GET() {
  try {
    const orders =
      await prisma.order.findMany({
        include: {
          items: {
            orderBy: {
              createdAt:
                "asc",
            },
          },

          statusHistory: {
            orderBy: {
              createdAt:
                "asc",
            },
          },
        },

        orderBy: {
          createdAt:
            "desc",
        },
      });

    return NextResponse.json(
      {
        success: true,

        orders:
          orders.map(
            serializeOrder
          ),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Siparişler alınamadı:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Siparişler alınırken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * =============================================================
 * POST
 *
 * Checkout → PostgreSQL
 * =============================================================
 */

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as
        CreateOrderRequestBody;

    /*
     * =========================================================
     * CUSTOMER
     * =========================================================
     */

    const email =
      isString(
        body.customer?.email
      )
        ? normalizeEmail(
            body.customer.email
          )
        : "";

    const firstName =
      isString(
        body.customer
          ?.firstName
      )
        ? body.customer.firstName.trim()
        : "";

    const lastName =
      isString(
        body.customer
          ?.lastName
      )
        ? body.customer.lastName.trim()
        : "";

    const phone =
      isString(
        body.customer?.phone
      )
        ? body.customer.phone.trim()
        : "";

    if (
      !email ||
      !firstName ||
      !lastName ||
      !phone
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Müşteri bilgileri eksik.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidEmail(email)
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Geçerli bir e-posta adresi girilmelidir.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =========================================================
     * SHIPPING
     * =========================================================
     */

    const shippingCountry =
      isString(
        body.shippingAddress
          ?.country
      )
        ? body.shippingAddress.country.trim()
        : "";

    const shippingAddress =
      isString(
        body.shippingAddress
          ?.address
      )
        ? body.shippingAddress.address.trim()
        : "";

    const shippingCity =
      isString(
        body.shippingAddress
          ?.city
      )
        ? body.shippingAddress.city.trim()
        : "";

    const shippingPostalCode =
      isString(
        body.shippingAddress
          ?.postalCode
      )
        ? body.shippingAddress.postalCode.trim()
        : "";

    const shippingAddressLineTwo =
      normalizeOptionalString(
        body.shippingAddress
          ?.addressLineTwo
      );

    const shippingState =
      normalizeOptionalString(
        body.shippingAddress
          ?.state
      );

    if (
      !shippingCountry ||
      !shippingAddress ||
      !shippingCity ||
      !shippingPostalCode
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Teslimat bilgileri eksik.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Türkiye satışını server tarafında
     * da engelliyoruz.
     */

    if (
      shippingCountry
        .trim()
        .toUpperCase() ===
      "TR"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Türkiye'ye satış yapılamamaktadır.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =========================================================
     * ITEMS
     * =========================================================
     */

    const requestedItems =
      normalizeOrderItems(
        body.items
      );

    if (!requestedItems) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Sipariş ürünleri geçersiz.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =========================================================
     * ÜRÜNLERİ PRODUCT ID BAZINDA GRUPLA
     *
     * Aynı ürün farklı renklerde sepette iki satır
     * olabilir. Stok toplam adede göre düşmelidir.
     * =========================================================
     */

    const quantitiesByProduct =
      new Map<string, number>();

    for (
      const item of
      requestedItems
    ) {
      quantitiesByProduct.set(
        item.productId,

        (
          quantitiesByProduct.get(
            item.productId
          ) ?? 0
        ) + item.quantity
      );
    }

    const productIds =
      Array.from(
        quantitiesByProduct.keys()
      );

    /*
     * =========================================================
     * TRANSACTION
     * =========================================================
     *
     * Aşağıdaki işlemler ya TAMAMI başarılı olur
     * ya da TAMAMI rollback edilir:
     *
     * - ürünleri doğrula
     * - stokları kontrol et
     * - stokları düşür
     * - Order oluştur
     * - OrderItem snapshot oluştur
     * - ilk status history kaydını oluştur
     * =========================================================
     */

    const createdOrder =
      await prisma.$transaction(
        async (tx) => {
          /*
           * ---------------------------------------------------
           * PRODUCTS
           * ---------------------------------------------------
           */

          const products =
            await tx.product.findMany({
              where: {
                id: {
                  in:
                    productIds,
                },
              },

              include: {
                images: {
                  orderBy: {
                    order:
                      "asc",
                  },
                },

                colors: {
                  orderBy: {
                    order:
                      "asc",
                  },
                },
              },
            });

          if (
            products.length !==
            productIds.length
          ) {
            throw new Error(
              "ORDER_PRODUCT_NOT_FOUND"
            );
          }

          const productMap =
            new Map(
              products.map(
                (
                  product
                ) => [
                  product.id,
                  product,
                ]
              )
            );

          /*
           * ---------------------------------------------------
           * PRODUCT VALIDATION
           * ---------------------------------------------------
           */

          for (
            const [
              productId,
              quantity,
            ] of
            quantitiesByProduct
          ) {
            const product =
              productMap.get(
                productId
              );

            if (!product) {
              throw new Error(
                "ORDER_PRODUCT_NOT_FOUND"
              );
            }

            if (
              !product.isActive
            ) {
              throw new Error(
                "ORDER_PRODUCT_INACTIVE"
              );
            }

            if (
              product.stock <
              quantity
            ) {
              throw new Error(
                "ORDER_INSUFFICIENT_STOCK"
              );
            }
          }

          /*
           * ---------------------------------------------------
           * CURRENCY
           *
           * Tek siparişte farklı para birimlerine
           * izin vermiyoruz.
           * ---------------------------------------------------
           */

          const currencies =
            new Set(
              products.map(
                (product) =>
                  product.currency
              )
            );

          if (
            currencies.size !==
            1
          ) {
            throw new Error(
              "ORDER_MIXED_CURRENCY"
            );
          }

          const orderCurrency =
            products[0]
              .currency;

          /*
           * ---------------------------------------------------
           * ORDER ITEMS SNAPSHOT + SUBTOTAL
           * ---------------------------------------------------
           */

          let subtotal = 0;

          const orderItems =
            requestedItems.map(
              (item) => {
                const product =
                  productMap.get(
                    item.productId
                  );

                if (!product) {
                  throw new Error(
                    "ORDER_PRODUCT_NOT_FOUND"
                  );
                }

                /*
                 * Renk gerçekten üründe mevcut mu?
                 */

                const productColors =
                  product.colors.map(
                    (color) =>
                      color.value
                  );

                if (
                  productColors.length >
                    0 &&
                  !productColors.includes(
                    item.color
                  )
                ) {
                  throw new Error(
                    "ORDER_INVALID_COLOR"
                  );
                }

                const sortedImages =
                  [
                    ...product.images,
                  ].sort(
                    (a, b) =>
                      a.order -
                      b.order
                  );

                const image =
                  sortedImages.find(
                    (
                      productImage
                    ) =>
                      productImage.isPrimary
                  ) ??
                  sortedImages[0];

                if (!image) {
                  throw new Error(
                    "ORDER_PRODUCT_IMAGE_MISSING"
                  );
                }

                const unitPrice =
                  Number(
                    product.price
                  );

                subtotal +=
                  unitPrice *
                  item.quantity;

                return {
                  productId:
                    product.id,

                  productSlug:
                    product.slug,

                  productNameTr:
                    product.nameTr,

                  productNameEn:
                    product.nameEn,

                  productNameAr:
                    product.nameAr,

                  imageUrl:
                    image.url,

                  color:
                    item.color,

                  quantity:
                    item.quantity,

                  unitPrice:
                    product.price,

                  currency:
                    product.currency,
                };
              }
            );

          /*
           * ---------------------------------------------------
           * SHIPPING
           *
           * Şimdilik 0.
           * İleride ülkeye göre server-side hesaplanacak.
           * ---------------------------------------------------
           */

          const shippingCost = 0;

          const total =
            subtotal +
            shippingCost;

          /*
           * ---------------------------------------------------
           * STOK DÜŞÜR
           *
           * updateMany + stock >= quantity kullanıyoruz.
           *
           * Böylece iki müşteri aynı anda son ürünü
           * satın almaya çalışırsa negatif stok oluşmaz.
           * ---------------------------------------------------
           */

          for (
            const [
              productId,
              quantity,
            ] of
            quantitiesByProduct
          ) {
            const result =
              await tx.product.updateMany({
                where: {
                  id:
                    productId,

                  isActive:
                    true,

                  stock: {
                    gte:
                      quantity,
                  },
                },

                data: {
                  stock: {
                    decrement:
                      quantity,
                  },
                },
              });

            if (
              result.count !==
              1
            ) {
              throw new Error(
                "ORDER_INSUFFICIENT_STOCK"
              );
            }
          }

          /*
           * ---------------------------------------------------
           * ORDER NUMBERS
           * ---------------------------------------------------
           */

          const orderNumber =
            createOrderNumber();

          const trackingCode =
            createTrackingCode();

          /*
           * ---------------------------------------------------
           * CREATE ORDER
           *
           * Nested write sayesinde Order + Items +
           * StatusHistory atomik oluşturulur.
           * ---------------------------------------------------
           */

          return tx.order.create({
            data: {
              orderNumber,

              trackingCode,

              status:
                OrderStatus.RECEIVED,

              paymentStatus:
                PaymentStatus.PENDING,

              customerEmail:
                email,

              customerFirstName:
                firstName,

              customerLastName:
                lastName,

              customerPhone:
                phone,

              shippingCountry,

              shippingAddress,

              shippingAddressLineTwo,

              shippingCity,

              shippingState,

              shippingPostalCode,

              subtotal,

              shippingCost,

              total,

              currency:
                orderCurrency as Currency,

              items: {
                create:
                  orderItems,
              },

              statusHistory: {
                create: {
                  status:
                    OrderStatus.RECEIVED,
                },
              },
            },

            include: {
              items: {
                orderBy: {
                  createdAt:
                    "asc",
                },
              },

              statusHistory: {
                orderBy: {
                  createdAt:
                    "asc",
                },
              },
            },
          });
        }
      );

    /*
     * =========================================================
     * RESPONSE
     * =========================================================
     */

    return NextResponse.json(
      {
        success: true,

        order:
          serializeOrder(
            createdOrder
          ),
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Sipariş oluşturulamadı:",
      error
    );

    /*
     * =========================================================
     * DOMAIN ERRORS
     * =========================================================
     */

    if (
      error instanceof Error
    ) {
      switch (
        error.message
      ) {
        case "ORDER_PRODUCT_NOT_FOUND":
          return NextResponse.json(
            {
              success:
                false,

              message:
                "Sepetteki ürünlerden biri artık mevcut değil.",
            },
            {
              status: 400,
            }
          );

        case "ORDER_PRODUCT_INACTIVE":
          return NextResponse.json(
            {
              success:
                false,

              message:
                "Sepetteki ürünlerden biri artık satışta değil.",
            },
            {
              status: 400,
            }
          );

        case "ORDER_INSUFFICIENT_STOCK":
          return NextResponse.json(
            {
              success:
                false,

              message:
                "Sepetteki ürünlerden biri için yeterli stok bulunmuyor.",
            },
            {
              status: 409,
            }
          );

        case "ORDER_MIXED_CURRENCY":
          return NextResponse.json(
            {
              success:
                false,

              message:
                "Farklı para birimlerindeki ürünler aynı siparişte kullanılamaz.",
            },
            {
              status: 400,
            }
          );

        case "ORDER_INVALID_COLOR":
          return NextResponse.json(
            {
              success:
                false,

              message:
                "Seçilen ürün renklerinden biri artık kullanılamıyor.",
            },
            {
              status: 400,
            }
          );

        case "ORDER_PRODUCT_IMAGE_MISSING":
          return NextResponse.json(
            {
              success:
                false,

              message:
                "Sipariş ürünlerinden birinin görsel bilgisi eksik.",
            },
            {
              status: 400,
            }
          );
      }
    }

    return NextResponse.json(
      {
        success: false,

        message:
          "Sipariş oluşturulurken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}