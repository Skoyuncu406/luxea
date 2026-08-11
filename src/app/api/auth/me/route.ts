import { NextResponse } from "next/server";

import {
  USER_SESSION_COOKIE,
  getUserSession,
} from "@/lib/auth/user-session";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session =
      await getUserSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          user: null,
        },
        {
          status: 401,
        }
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id:
            session.userId,
        },

        select: {
          id:
            true,

          email:
            true,

          firstName:
            true,

          lastName:
            true,

          phone:
            true,

          emailVerified:
            true,

          createdAt:
            true,

          updatedAt:
            true,
        },
      });

    /*
     * Token geçerli olsa bile kullanıcı DB'den
     * silinmiş olabilir.
     */
    if (!user) {
      const response =
        NextResponse.json(
          {
            success: false,
            user: null,
          },
          {
            status: 401,
          }
        );

      response.cookies.set({
        name:
          USER_SESSION_COOKIE,

        value:
          "",

        httpOnly:
          true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          "lax",

        path:
          "/",

        maxAge:
          0,
      });

      return response;
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
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Kullanıcı oturumu alınamadı:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        user: null,

        message:
          "Kullanıcı bilgileri alınırken bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}