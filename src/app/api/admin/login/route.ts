import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionMaxAge,
  normalizeAdminEmail,
  validateAdminCredentials,
} from "@/lib/auth/admin-session";

type LoginRequestBody = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as LoginRequestBody;

    const email =
      typeof body.email === "string"
        ? body.email
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email.trim() || !password) {
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

    const credentialsAreValid =
      validateAdminCredentials(
        email,
        password
      );

    if (!credentialsAreValid) {
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

    const normalizedEmail =
      normalizeAdminEmail(email);

    const token =
      await createAdminSessionToken({
        email: normalizedEmail,
        role: "admin",
      });

    const response = NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge: getAdminSessionMaxAge(),
    });

    return response;
  } catch (error) {
    console.error(
      "Admin giriş işlemi başarısız:",
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