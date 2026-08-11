import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import {
  USER_SESSION_COOKIE,
  createUserSessionToken,
  getUserSessionMaxAge,
  normalizeUserEmail,
} from "@/lib/auth/user-session";

import { prisma } from "@/lib/prisma";

type RegisterRequestBody = {
  email?: unknown;
  password?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;
};

function isString(
  value: unknown
): value is string {
  return typeof value === "string";
}

function isValidEmail(
  value: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

function isValidPassword(
  value: string
) {
  return value.length >= 8;
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as
        RegisterRequestBody;

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

    const firstName =
      isString(body.firstName)
        ? body.firstName.trim()
        : "";

    const lastName =
      isString(body.lastName)
        ? body.lastName.trim()
        : "";

    const phone =
      isString(body.phone)
        ? body.phone.trim()
        : "";

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "E-posta, şifre, ad ve soyad alanları zorunludur.",
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

    if (
      !isValidPassword(
        password
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Şifre en az 8 karakter olmalıdır.",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },

        select: {
          id: true,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bu e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut.",
        },
        {
          status: 409,
        }
      );
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    const user =
      await prisma.user.create({
        data: {
          email,

          passwordHash,

          firstName,

          lastName,

          phone:
            phone || null,
        },

        select: {
          id: true,

          email: true,

          firstName: true,

          lastName: true,

          phone: true,

          emailVerified: true,

          createdAt: true,
        },
      });

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
            ...user,

            createdAt:
              user.createdAt.toISOString(),
          },
        },
        {
          status: 201,
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
      "Kullanıcı kaydı oluşturulamadı:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Kayıt işlemi sırasında bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}