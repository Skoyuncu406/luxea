import { NextResponse } from "next/server";

import {
  getUserSession,
} from "@/lib/auth/user-session";

import { prisma } from "@/lib/prisma";

type AddressRouteContext = {
  params: Promise<{
    addressId: string;
  }>;
};

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function unauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Bu işlem için kullanıcı girişi gereklidir.",
    },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

function notFoundResponse() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Adres bulunamadı.",
    },
    {
      status: 404,
    }
  );
}

function normalizeOptionalString(
  value: unknown
) {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

/*
 * ============================================================
 * PATCH
 * ============================================================
 */

export async function PATCH(
  request: Request,
  context: AddressRouteContext
) {
  try {
    const session =
      await getUserSession();

    if (!session) {
      return unauthorizedResponse();
    }

    const {
      addressId,
    } = await context.params;

    /*
     * Güvenlik:
     * adres sadece kendi userId'si ile birlikte aranır.
     */

    const existingAddress =
      await prisma.address.findFirst({
        where: {
          id:
            addressId,

          userId:
            session.userId,
        },
      });

    if (!existingAddress) {
      return notFoundResponse();
    }

    let body: unknown;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Geçersiz istek verisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body ||
      typeof body !==
        "object"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Geçersiz istek verisi.",
        },
        {
          status: 400,
        }
      );
    }

    const data =
      body as Record<
        string,
        unknown
      >;

    const label =
      normalizeOptionalString(
        data.label
      );

    const firstName =
      typeof data.firstName ===
      "string"
        ? data.firstName.trim()
        : "";

    const lastName =
      typeof data.lastName ===
      "string"
        ? data.lastName.trim()
        : "";

    const phone =
      normalizeOptionalString(
        data.phone
      );

    const country =
      typeof data.country ===
      "string"
        ? data.country.trim()
        : "";

    const address =
      typeof data.address ===
      "string"
        ? data.address.trim()
        : "";

    const addressLineTwo =
      normalizeOptionalString(
        data.addressLineTwo
      );

    const city =
      typeof data.city ===
      "string"
        ? data.city.trim()
        : "";

    const state =
      normalizeOptionalString(
        data.state
      );

    const postalCode =
      typeof data.postalCode ===
      "string"
        ? data.postalCode.trim()
        : "";

    const isDefault =
      data.isDefault ===
      true;

    if (
      !firstName ||
      !lastName ||
      !country ||
      !address ||
      !city ||
      !postalCode
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Ad, soyad, ülke, adres, şehir ve posta kodu zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    const updatedAddress =
      await prisma.$transaction(
        async (tx) => {
          if (isDefault) {
            await tx.address.updateMany({
              where: {
                userId:
                  session.userId,

                isDefault:
                  true,

                id: {
                  not:
                    addressId,
                },
              },

              data: {
                isDefault:
                  false,
              },
            });
          }

          return tx.address.update({
            where: {
              id:
                addressId,
            },

            data: {
              label,

              firstName,
              lastName,
              phone,

              country,
              address,
              addressLineTwo,
              city,
              state,
              postalCode,

              /*
               * Mevcut varsayılan adres
               * isDefault=false gönderilerek
               * varsayılansız bırakılmasın.
               */

              isDefault:
                existingAddress.isDefault
                  ? true
                  : isDefault,
            },
          });
        }
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Adres başarıyla güncellendi.",

        address: {
          ...updatedAddress,

          createdAt:
            updatedAddress.createdAt.toISOString(),

          updatedAt:
            updatedAddress.updatedAt.toISOString(),
        },
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
      "Adres güncellenemedi:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Adres güncellenirken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * ============================================================
 * DELETE
 * ============================================================
 */

export async function DELETE(
  _request: Request,
  context: AddressRouteContext
) {
  try {
    const session =
      await getUserSession();

    if (!session) {
      return unauthorizedResponse();
    }

    const {
      addressId,
    } = await context.params;

    const existingAddress =
      await prisma.address.findFirst({
        where: {
          id:
            addressId,

          userId:
            session.userId,
        },
      });

    if (!existingAddress) {
      return notFoundResponse();
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.address.delete({
          where: {
            id:
              addressId,
          },
        });

        /*
         * Silinen adres varsayılan adres ise
         * kalan en güncel adres varsayılan yapılır.
         */

        if (
          existingAddress.isDefault
        ) {
          const nextAddress =
            await tx.address.findFirst({
              where: {
                userId:
                  session.userId,
              },

              orderBy: {
                updatedAt:
                  "desc",
              },

              select: {
                id:
                  true,
              },
            });

          if (nextAddress) {
            await tx.address.update({
              where: {
                id:
                  nextAddress.id,
              },

              data: {
                isDefault:
                  true,
              },
            });
          }
        }
      }
    );

    return NextResponse.json(
      {
        success: true,

        message:
          "Adres başarıyla silindi.",
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
      "Adres silinemedi:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Adres silinirken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}