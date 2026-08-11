import { randomUUID } from "crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  Currency,
  OrderStatus,
  PaymentStatus,
} from "@/generated/prisma/client";

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-session";

import { prisma } from "@/lib/prisma";

import {
  getUserSession,
} from "@/lib/auth/user-session";

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
   * Client'tan gelebilirler ancak fiyat hesaplamasında
   * güvenilir kaynak olarak KULLANILMAZLAR.
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
 * FRONTEND ORDER STATUS
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
 * GENERAL HELPERS
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

  return normalized || undefined;
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
 * ADMIN SESSION
 * =============================================================
 *
 * GET /api/orders yalnızca admin tarafından kullanılabilir.
 *
 * POST /api/orders bu kontrolü KULLANMAZ.
 * Guest checkout public kalır.
 * =============================================================
 */

async function requireAdminSession() {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      ADMIN_SESSION_COOKIE
    )?.value;

  if (!token) {
    return null;
  }

  return verifyAdminSessionToken(
    token
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
 * ORDER SERIALIZER
 * =============================================================
 */

function serializeOrder(
  order:
    NonNullable<OrderWithRelations>
) {
  return {
    id:
      order.id,

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
          id:
            item.id,

          /*
           * Ürün daha sonra silinirse
           * OrderItem.productId null olabilir.
           */
          productId:
            item.productId ??
            "",

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

  for (
    const rawItem of value
  ) {
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
      isString(
        item.color
      )
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
 * GET /api/orders
 * =============================================================
 *
 * ADMIN ONLY
 *
 * Bütün müşteri siparişlerini döndürdüğü için bu endpoint
 * public olamaz.
 *
 * Admin session cookie:
 *
 * luxea-admin-session
 *
 * doğrulanmadan sipariş bilgileri verilmez.
 * =============================================================
 */

export async function GET() {
  try {
    /*
     * =========================================================
     * ADMIN AUTH
     * =========================================================
     */

    const session =
      await requireAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Bu işlem için admin girişi gereklidir.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * =========================================================
     * ORDERS
     * =========================================================
     */

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

    /*
     * =========================================================
     * RESPONSE
     * =========================================================
     */

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

        headers: {
          "Cache-Control":
            "no-store",
        },
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
 * POST /api/orders
 * =============================================================
 *
 * PUBLIC CHECKOUT
 *
 * Guest kullanıcıların da alışveriş yapabilmesi için
 * admin session KULLANILMAZ.
 *
 * Checkout
 *      ↓
 * POST /api/orders
 *      ↓
 * server validation
 *      ↓
 * PostgreSQL transaction
 * =============================================================
 */

export async function POST(
  request: Request
) {
  try {
    /*
     * =========================================================
     * OPTIONAL USER SESSION
     * =========================================================
     *
     * Kullanıcı giriş yapmış olabilir veya guest olabilir.
     *
     * Session zorunlu DEĞİLDİR.
     */

    const userSession =
      await getUserSession();

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
        body.customer?.firstName
      )
        ? body.customer.firstName.trim()
        : "";

    const lastName =
      isString(
        body.customer?.lastName
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
      !isValidEmail(
        email
      )
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
     * SHIPPING ADDRESS
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
     * =========================================================
     * TÜRKİYE SATIŞ KONTROLÜ
     * =========================================================
     *
     * Frontend kontrolüne güvenmiyoruz.
     * Server tarafında da engellenir.
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
     * QUANTITIES BY PRODUCT
     * =========================================================
     *
     * Aynı ürün farklı renklerle birden fazla sepet satırında
     * bulunabilir.
     *
     * Stok kontrolü toplam ürün adedi üzerinden yapılır.
     */

    const quantitiesByProduct =
      new Map<
        string,
        number
      >();

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
        ) +
          item.quantity
      );
    }

    const productIds =
      Array.from(
        quantitiesByProduct.keys()
      );

    /*
     * ============================================================
     * ORDER USER
     * ============================================================
     *
     * Giriş yapmış kullanıcı:
     * Sipariş doğrudan session kullanıcısına bağlanır.
     *
     * Checkout e-postası müşteri / iletişim bilgisi olarak
     * saklanmaya devam eder ve hesap e-postasıyla aynı olmak
     * zorunda değildir.
     *
     * Guest checkout:
     * userId null kalır.
     * ============================================================
     */

    let orderUserId:
      string | null = null;

    if (userSession) {
      const sessionUser =
        await prisma.user.findUnique({
          where: {
            id:
              userSession.userId,
          },

          select: {
            id:
              true,
          },
        });

      if (sessionUser) {
        orderUserId =
          sessionUser.id;
      }
    }

    /*
     * =========================================================
     * TRANSACTION
     * =========================================================
     *
     * Hepsi başarılı:
     *
     * COMMIT
     *
     * herhangi biri başarısız:
     *
     * ROLLBACK
     *
     * İşlemler:
     *
     * - ürün kontrolü
     * - aktiflik kontrolü
     * - stok kontrolü
     * - fiyat hesaplama
     * - stok düşürme
     * - Order oluşturma
     * - OrderItem oluşturma
     * - OrderStatusHistory oluşturma
     * =========================================================
     */

    const createdOrder =
      await prisma.$transaction(
        async (tx) => {
          /*
           * ===================================================
           * PRODUCTS
           * ===================================================
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

          /*
           * ===================================================
           * PRODUCT EXISTENCE
           * ===================================================
           */

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
           * ===================================================
           * PRODUCT / STOCK VALIDATION
           * ===================================================
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
           * ===================================================
           * CURRENCY
           * ===================================================
           *
           * Aynı sipariş içinde farklı para birimleri
           * şimdilik desteklenmiyor.
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
           * ===================================================
           * ORDER ITEM SNAPSHOTS
           * ===================================================
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
                 * =============================================
                 * COLOR VALIDATION
                 * =============================================
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

                /*
                 * =============================================
                 * PRIMARY IMAGE
                 * =============================================
                 */

                const sortedImages =
                  [
                    ...product.images,
                  ].sort(
                    (
                      a,
                      b
                    ) =>
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

                /*
                 * =============================================
                 * SERVER-SIDE PRICE
                 * =============================================
                 *
                 * Client fiyatına güvenilmez.
                 */

                const unitPrice =
                  Number(
                    product.price
                  );

                subtotal +=
                  unitPrice *
                  item.quantity;

                /*
                 * =============================================
                 * SNAPSHOT
                 * =============================================
                 *
                 * Ürün ileride değiştirilse dahi sipariş
                 * geçmişindeki isim, fiyat ve görsel korunur.
                 */

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
           * ===================================================
           * SHIPPING
           * ===================================================
           *
           * Şimdilik ücretsiz.
           *
           * İleride ülke bazlı server-side hesaplanabilir.
           */

          const shippingCost =
            0;

          const total =
            subtotal +
            shippingCost;

          /*
           * ===================================================
           * STOCK DECREMENT
           * ===================================================
           *
           * Atomic stock protection:
           *
           * stock >= quantity şartıyla update yapılır.
           *
           * Aynı anda iki müşteri son ürünü satın almaya
           * çalışırsa negatif stok oluşmasını engeller.
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
           * ===================================================
           * ORDER NUMBER
           * ===================================================
           */

          const orderNumber =
            createOrderNumber();

          /*
           * ===================================================
           * TRACKING CODE
           * ===================================================
           */

          const trackingCode =
            createTrackingCode();

          /*
           * ===================================================
           * CREATE ORDER
           * ===================================================
           */

          return tx.order.create({
            data: {
              /*
               * =================================================
               * USER
               * =================================================
               *
               * Guest sipariş:
               * null
               *
               * Giriş yapmış kullanıcı:
               * session user id
               */

              userId:
                orderUserId,

              orderNumber,

              trackingCode,

              status:
                OrderStatus.RECEIVED,

              /*
               * Gerçek ödeme sistemi geldiğinde
               * webhook PAID durumuna geçirecek.
               */
              paymentStatus:
                PaymentStatus.PENDING,

              /*
               * CUSTOMER
               */
              customerEmail:
                email,

              customerFirstName:
                firstName,

              customerLastName:
                lastName,

              customerPhone:
                phone,

              /*
               * SHIPPING
               */
              shippingCountry,

              shippingAddress,

              shippingAddressLineTwo,

              shippingCity,

              shippingState,

              shippingPostalCode,

              /*
               * MONEY
               */
              subtotal,

              shippingCost,

              total,

              currency:
                orderCurrency as Currency,

              /*
               * ORDER ITEMS
               */
              items: {
                create:
                  orderItems,
              },

              /*
               * INITIAL STATUS HISTORY
               */
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
     * SUCCESS RESPONSE
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

        headers: {
          "Cache-Control":
            "no-store",
        },
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
        /*
         * -----------------------------------------------------
         * PRODUCT NOT FOUND
         * -----------------------------------------------------
         */

        case "ORDER_PRODUCT_NOT_FOUND":
          return NextResponse.json(
            {
              success:
                false,

              message:
                "Sepetteki ürünlerden biri artık mevcut değil.",
            },
            {
              status:
                400,
            }
          );

        /*
         * -----------------------------------------------------
         * PRODUCT INACTIVE
         * -----------------------------------------------------
         */

        case "ORDER_PRODUCT_INACTIVE":
          return NextResponse.json(
            {
              success:
                false,

              message:
                "Sepetteki ürünlerden biri artık satışta değil.",
            },
            {
              status:
                400,
            }
          );

        /*
         * -----------------------------------------------------
         * STOCK
         * -----------------------------------------------------
         */

        case "ORDER_INSUFFICIENT_STOCK":
          return NextResponse.json(
            {
              success:
                false,

              message:
                "Sepetteki ürünlerden biri için yeterli stok bulunmuyor.",
            },
            {
              status:
                409,
            }
          );

        /*
         * -----------------------------------------------------
         * CURRENCY
         * -----------------------------------------------------
         */

        case "ORDER_MIXED_CURRENCY":
          return NextResponse.json(
            {
              success:
                false,

              message:
                "Farklı para birimlerindeki ürünler aynı siparişte kullanılamaz.",
            },
            {
              status:
                400,
            }
          );

        /*
         * -----------------------------------------------------
         * COLOR
         * -----------------------------------------------------
         */

        case "ORDER_INVALID_COLOR":
          return NextResponse.json(
            {
              success:
                false,

              message:
                "Seçilen ürün renklerinden biri artık kullanılamıyor.",
            },
            {
              status:
                400,
            }
          );

        /*
         * -----------------------------------------------------
         * IMAGE
         * -----------------------------------------------------
         */

        case "ORDER_PRODUCT_IMAGE_MISSING":
          return NextResponse.json(
            {
              success:
                false,

              message:
                "Sipariş ürünlerinden birinin görsel bilgisi eksik.",
            },
            {
              status:
                400,
            }
          );
      }
    }

    /*
     * =========================================================
     * UNKNOWN SERVER ERROR
     * =========================================================
     */

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