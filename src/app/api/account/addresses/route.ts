import { NextResponse } from "next/server";

import {
  getUserSession,
} from "@/lib/auth/user-session";

import { prisma } from "@/lib/prisma";

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
 * GET
 *
 * Kullanıcının kendi kayıtlı adreslerini döndürür.
 * ============================================================
 */

export async function GET() {
  try {
    const session =
      await getUserSession();

    if (!session) {
      return unauthorizedResponse();
    }

    const addresses =
      await prisma.address.findMany({
        where: {
          userId:
            session.userId,
        },

        orderBy: [
          {
            isDefault:
              "desc",
          },

          {
            updatedAt:
              "desc",
          },
        ],
      });

    return NextResponse.json(
      {
        success: true,

        addresses:
          addresses.map(
            (address) => ({
              ...address,

              createdAt:
                address.createdAt.toISOString(),

              updatedAt:
                address.updatedAt.toISOString(),
            })
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
      "Adresler alınamadı:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Adresler alınırken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * ============================================================
 * POST
 *
 * Yeni adres oluşturur.
 * ============================================================
 */

export async function POST(
  request: Request
) {
  try {
    const session =
      await getUserSession();

    if (!session) {
      return unauthorizedResponse();
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

    /*
     * --------------------------------------------------------
     * VALIDATION
     * --------------------------------------------------------
     */

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

    if (
      firstName.length > 80 ||
      lastName.length > 80 ||
      country.length > 100 ||
      city.length > 100 ||
      postalCode.length > 30
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Adres bilgilerinden biri izin verilen uzunluğu aşıyor.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * --------------------------------------------------------
     * DEFAULT ADDRESS LOGIC
     * --------------------------------------------------------
     *
     * Kullanıcının hiç adresi yoksa
     * ilk adres otomatik varsayılan olur.
     */

    const addressCount =
      await prisma.address.count({
        where: {
          userId:
            session.userId,
        },
      });

    const shouldBeDefault =
      addressCount === 0 ||
      isDefault;

    /*
     * --------------------------------------------------------
     * TRANSACTION
     * --------------------------------------------------------
     */

    const createdAddress =
      await prisma.$transaction(
        async (tx) => {
          /*
           * Yeni adres varsayılan olacaksa
           * diğer varsayılan adresleri kaldır.
           */

          if (
            shouldBeDefault
          ) {
            await tx.address.updateMany({
              where: {
                userId:
                  session.userId,

                isDefault:
                  true,
              },

              data: {
                isDefault:
                  false,
              },
            });
          }

          return tx.address.create({
            data: {
              userId:
                session.userId,

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

              isDefault:
                shouldBeDefault,
            },
          });
        }
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Adres başarıyla eklendi.",

        address: {
          ...createdAddress,

          createdAt:
            createdAddress.createdAt.toISOString(),

          updatedAt:
            createdAddress.updatedAt.toISOString(),
        },
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
      "Adres oluşturulamadı:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Adres oluşturulurken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}