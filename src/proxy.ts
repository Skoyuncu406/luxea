import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-session";

const LOCALES = ["tr", "en", "ar"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const locale = LOCALES.find((item) =>
    pathname.startsWith(`/${item}`)
  );

  if (!locale) {
    return NextResponse.next();
  }

  const loginPath = `/${locale}/admin/login`;

  if (pathname === loginPath) {
    return NextResponse.next();
  }

  if (pathname.startsWith(`/${locale}/admin`)) {
    const token =
      request.cookies.get(
        ADMIN_SESSION_COOKIE
      )?.value;

    if (!token) {
      return NextResponse.redirect(
        new URL(loginPath, request.url)
      );
    }

    const session =
      await verifyAdminSessionToken(token);

    if (!session) {
      const response =
        NextResponse.redirect(
          new URL(loginPath, request.url)
        );

      response.cookies.delete(
        ADMIN_SESSION_COOKIE
      );

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/tr/admin/:path*",
    "/en/admin/:path*",
    "/ar/admin/:path*",
  ],
};