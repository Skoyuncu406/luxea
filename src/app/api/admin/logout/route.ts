import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
} from "@/lib/auth/admin-session";

export async function POST() {
  try {
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
      value: "",
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error(
      "Admin çıkış işlemi başarısız:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Çıkış işlemi sırasında bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}