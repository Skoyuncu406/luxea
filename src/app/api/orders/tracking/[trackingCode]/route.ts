import { NextResponse } from "next/server";

import {
  OrderStatus,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

type TrackingRouteProps = {
  params: Promise<{
    trackingCode: string;
  }>;
};

type FrontendOrderStatus =
  | "received"
  | "payment-confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

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

async function getOrderByTrackingCode(
  trackingCode: string
) {
  return prisma.order.findUnique({
    where: {
      trackingCode,
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
      typeof getOrderByTrackingCode
    >
  >;

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

export async function GET(
  _request: Request,
  {
    params,
  }: TrackingRouteProps
) {
  try {
    const {
      trackingCode,
    } = await params;

    const normalizedTrackingCode =
      decodeURIComponent(
        trackingCode
      )
        .trim()
        .toUpperCase();

    if (
      !normalizedTrackingCode
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Takip kodu geçersiz.",
        },
        {
          status: 400,
        }
      );
    }

    const order =
      await getOrderByTrackingCode(
        normalizedTrackingCode
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
      "Sipariş takip bilgisi alınamadı:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Sipariş bilgisi alınırken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}