import { NextResponse } from "next/server";

import {
  USER_SESSION_COOKIE,
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
      user: null,
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

function clearInvalidSession(
  response: NextResponse
) {
  response.cookies.set({
    name: USER_SESSION_COOKIE,
    value: "",
    httpOnly: true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

/*
 * ============================================================
 * GET
 *
 * Giriş yapmış kullanıcının profil bilgilerini döndürür.
 * ============================================================
 */

export async function GET() {
  try {
    const session =
      await getUserSession();

    if (!session) {
      return unauthorizedResponse();
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: session.userId,
        },

        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    /*
     * Cookie geçerli görünse bile kullanıcı
     * veritabanından silinmiş olabilir.
     */

    if (!user) {
      const response =
        NextResponse.json(
          {
            success: false,
            user: null,

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

      return clearInvalidSession(
        response
      );
    }

    return NextResponse.json(
      {
        success: true,

        user: {
          ...user,

          createdAt:
            user.createdAt.toISOString(),

          updatedAt:
            user.updatedAt.toISOString(),
        },
      },
      {
        status: 200,

        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Profil bilgileri alınamadı:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        user: null,

        message:
          "Profil bilgileri alınırken bir hata oluştu.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

/*
 * ============================================================
 * PATCH
 *
 * Kullanıcı yalnızca:
 *
 * - firstName
 * - lastName
 * - phone
 *
 * alanlarını değiştirebilir.
 *
 * E-posta bu endpoint üzerinden değiştirilemez.
 * ============================================================
 */

export async function PATCH(
  request: Request
) {
  try {
    /*
     * --------------------------------------------------------
     * SESSION
     * --------------------------------------------------------
     */

    const session =
      await getUserSession();

    if (!session) {
      return unauthorizedResponse();
    }

    /*
     * --------------------------------------------------------
     * BODY
     * --------------------------------------------------------
     */

    let body: unknown;

    try {
      body = await request.json();
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
      typeof body !== "object"
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

    /*
     * --------------------------------------------------------
     * INPUT NORMALIZATION
     * --------------------------------------------------------
     */

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
      typeof data.phone ===
      "string"
        ? data.phone.trim()
        : "";

    /*
     * --------------------------------------------------------
     * VALIDATION
     * --------------------------------------------------------
     */

    if (
      !firstName ||
      !lastName
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Ad ve soyad alanları zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      firstName.length > 80 ||
      lastName.length > 80
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Ad veya soyad alanı çok uzun.",
        },
        {
          status: 400,
        }
      );
    }

    if (phone.length > 30) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Telefon numarası çok uzun.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * --------------------------------------------------------
     * USER CHECK
     * --------------------------------------------------------
     */

    const existingUser =
      await prisma.user.findUnique({
        where: {
          id: session.userId,
        },

        select: {
          id: true,
        },
      });

    if (!existingUser) {
      const response =
        NextResponse.json(
          {
            success: false,
            user: null,

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

      return clearInvalidSession(
        response
      );
    }

    /*
     * --------------------------------------------------------
     * UPDATE
     * --------------------------------------------------------
     */

    const user =
      await prisma.user.update({
        where: {
          id: session.userId,
        },

        data: {
          firstName,
          lastName,

          phone:
            phone.length > 0
              ? phone
              : null,
        },

        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    /*
     * --------------------------------------------------------
     * RESPONSE
     * --------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,

        message:
          "Profil bilgileriniz güncellendi.",

        user: {
          ...user,

          createdAt:
            user.createdAt.toISOString(),

          updatedAt:
            user.updatedAt.toISOString(),
        },
      },
      {
        status: 200,

        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Profil güncellenemedi:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Profil bilgileri güncellenirken bir hata oluştu.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}