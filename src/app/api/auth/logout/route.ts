import { NextResponse } from "next/server";

import {
  USER_SESSION_COOKIE,
} from "@/lib/auth/user-session";

export async function POST() {
  const response =
    NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
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