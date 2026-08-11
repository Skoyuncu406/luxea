import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import {
  USER_SESSION_COOKIE,
  createUserSessionToken,
  getUserSessionMaxAge,
  normalizeUserEmail,
} from "@/lib/auth/user-session";

import { prisma } from "@/lib/prisma";

type LoginRequestBody = {
  email?: unknown;
  password?: unknown;
};

function isString(
  value: unknown
): value is string {
  return typeof value === "string";
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as
        LoginRequestBody;

    const email =
      isString(body.email)
        ? normalizeUserEmail(
            body.email
          )
        : "";

    const password =
      isString(body.password)
        ? body.password
        : "";

    if (
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "E-posta ve şifre alanları zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    /*
     * Kullanıcının var olup olmadığını ayrı ayrı
     * açıklamıyoruz.
     *
     * Böylece e-posta enumeration riskini azaltıyoruz.
     */
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "E-posta veya şifre hatalı.",
        },
        {
          status: 401,
        }
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message:
            "E-posta veya şifre hatalı.",
        },
        {
          status: 401,
        }
      );
    }

    const token =
      await createUserSessionToken({
        userId:
          user.id,

        email:
          user.email,

        role:
          "user",
      });

    const response =
      NextResponse.json(
        {
          success: true,

          user: {
            id:
              user.id,

            email:
              user.email,

            firstName:
              user.firstName,

            lastName:
              user.lastName,

            phone:
              user.phone,

            emailVerified:
              user.emailVerified,

            createdAt:
              user.createdAt.toISOString(),
          },
        },
        {
          status: 200,
        }
      );

    response.cookies.set({
      name:
        USER_SESSION_COOKIE,

      value:
        token,

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
        getUserSessionMaxAge(),
    });

    return response;
  } catch (error) {
    console.error(
      "Kullanıcı girişi başarısız:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Giriş işlemi sırasında bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}