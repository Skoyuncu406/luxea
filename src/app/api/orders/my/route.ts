import { NextResponse } from "next/server";

import {
  OrderStatus,
} from "@/generated/prisma/client";

import {
  getUserSession,
} from "@/lib/auth/user-session";

import { prisma } from "@/lib/prisma";

/*
 * =============================================================
 * TYPES
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

async function getUserOrders(
  userId: string
) {
  return prisma.order.findMany({
    where: {
      userId,
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

    orderBy: {
      createdAt: "desc",
    },
  });
}

/*
 * =============================================================
 * SERIALIZER
 * =============================================================
 */

type UserOrder =
  Awaited<
    ReturnType<
      typeof getUserOrders
    >
  >[number];

function serializeOrder(
  order: UserOrder
) {
  return {
    id:
      order.id,

    orderNumber:
      order.orderNumber,

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
 * GET /api/orders/my
 *
 * SADECE OTURUM AÇMIŞ KULLANICI
 * =============================================================
 */

export async function GET() {
  try {
    /*
     * ---------------------------------------------------------
     * USER SESSION
     * ---------------------------------------------------------
     */

    const session =
      await getUserSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,

          orders: [],

          message:
            "Siparişlerinizi görüntülemek için giriş yapmanız gereklidir.",
        },
        {
          status: 401,

          headers: {
            "Cache-Control":
              "no-store",
          },
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * USER CHECK
     * ---------------------------------------------------------
     *
     * Session token geçerli görünse bile kullanıcı
     * daha sonra DB'den silinmiş olabilir.
     */

    const user =
      await prisma.user.findUnique({
        where: {
          id:
            session.userId,
        },

        select: {
          id: true,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,

          orders: [],

          message:
            "Kullanıcı hesabı bulunamadı.",
        },
        {
          status: 401,

          headers: {
            "Cache-Control":
              "no-store",
          },
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * ORDERS
     * ---------------------------------------------------------
     */

    const orders =
      await getUserOrders(
        user.id
      );

    /*
     * ---------------------------------------------------------
     * RESPONSE
     * ---------------------------------------------------------
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
      "Kullanıcı siparişleri alınamadı:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        orders: [],

        message:
          "Siparişleriniz alınırken bir hata oluştu.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}