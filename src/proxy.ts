import { NextRequest, NextResponse } from "next/server";
import {
  defaultLocale,
  isValidLocale,
} from "@/lib/i18n/config";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameLocale = pathname.split("/")[1];

  if (isValidLocale(pathnameLocale)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  url.pathname =
    pathname === "/"
      ? `/${defaultLocale}`
      : `/${defaultLocale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};