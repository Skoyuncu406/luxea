import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  OrderStatus,
} from "@/generated/prisma/client";

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-session";

import { prisma } from "@/lib/prisma";

/*
 * =============================================================
 * ROUTE TYPES
 * =============================================================
 */

type OrderRouteProps = {
  params: Promise<{
    orderId: string;
  }>;
};

type UpdateOrderRequestBody = {
  status?: unknown;
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
 * ADMIN AUTH
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
 * STATUS HELPERS
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

function parseOrderStatus(
  value: unknown
): OrderStatus | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  switch (value) {
    case "received":
      return OrderStatus.RECEIVED;

    case "payment-confirmed":
      return OrderStatus.PAYMENT_CONFIRMED;

    case "preparing":
      return OrderStatus.PREPARING;

    case "shipped":
      return OrderStatus.SHIPPED;

    case "delivered":
      return OrderStatus.DELIVERED;

    case "cancelled":
      return OrderStatus.CANCELLED;

    default:
      return null;
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
           * OrderItem.productId SetNull olur.
           *
           * Frontend mevcut tipinde string
           * beklediği için "" dönüyoruz.
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
 * GET
 *
 * Admin tarafından tek sipariş görüntüleme.
 * =============================================================
 */

export async function GET(
  _request: Request,
  {
    params,
  }: OrderRouteProps
) {
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
     * PARAMS
     * =========================================================
     */

    const {
      orderId,
    } = await params;

    const normalizedOrderId =
      orderId.trim();

    if (
      !normalizedOrderId
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Sipariş kimliği geçersiz.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =========================================================
     * ORDER
     * =========================================================
     */

    const order =
      await getOrderById(
        normalizedOrderId
      );

    if (!order) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Sipariş bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,

        order:
          serializeOrder(
            order
          ),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Sipariş alınamadı:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Sipariş alınırken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * =============================================================
 * PATCH
 *
 * Admin tarafından sipariş durumu güncelleme.
 * =============================================================
 */

export async function PATCH(
  request: Request,
  {
    params,
  }: OrderRouteProps
) {
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
     * PARAMS
     * =========================================================
     */

    const {
      orderId,
    } = await params;

    const normalizedOrderId =
      orderId.trim();

    if (
      !normalizedOrderId
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Sipariş kimliği geçersiz.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =========================================================
     * BODY
     * =========================================================
     */

    const body =
      (await request.json()) as
        UpdateOrderRequestBody;

    const nextStatus =
      parseOrderStatus(
        body.status
      );

    if (!nextStatus) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Geçerli bir sipariş durumu seçilmelidir.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =========================================================
     * CURRENT ORDER
     * =========================================================
     */

    const currentOrder =
      await prisma.order.findUnique({
        where: {
          id:
            normalizedOrderId,
        },

        select: {
          id: true,
          status: true,
        },
      });

    if (!currentOrder) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Sipariş bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * =========================================================
     * AYNI DURUM
     * =========================================================
     *
     * Aynı status tekrar gönderildiyse
     * gereksiz history kaydı oluşturmayacağız.
     */

    if (
      currentOrder.status ===
      nextStatus
    ) {
      const order =
        await getOrderById(
          normalizedOrderId
        );

      if (!order) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Sipariş bulunamadı.",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json(
        {
          success: true,

          order:
            serializeOrder(
              order
            ),
        },
        {
          status: 200,
        }
      );
    }

    /*
     * =========================================================
     * TRANSACTION
     * =========================================================
     *
     * Order.status ve OrderStatusHistory
     * birlikte değişir.
     */

    await prisma.$transaction(
      async (tx) => {
        await tx.order.update({
          where: {
            id:
              normalizedOrderId,
          },

          data: {
            status:
              nextStatus,
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId:
              normalizedOrderId,

            status:
              nextStatus,
          },
        });
      }
    );

    /*
     * =========================================================
     * UPDATED ORDER
     * =========================================================
     */

    const updatedOrder =
      await getOrderById(
        normalizedOrderId
      );

    if (!updatedOrder) {
      throw new Error(
        "Güncellenen sipariş tekrar alınamadı."
      );
    }

    return NextResponse.json(
      {
        success: true,

        order:
          serializeOrder(
            updatedOrder
          ),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Sipariş durumu güncellenemedi:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Sipariş durumu güncellenirken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}