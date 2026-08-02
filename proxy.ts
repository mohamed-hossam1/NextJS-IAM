import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "@/constants/routes";

const PROTECTED_PREFIX = ROUTES.DASHBOARD;

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hasToken =
    request.cookies.has("refresh_token") ||
    request.cookies.has("access_token");

  if (pathname.startsWith(PROTECTED_PREFIX)) {
    if (!hasToken) {
      const loginUrl = new URL(ROUTES.LOGIN, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (hasToken) {
    if (searchParams.has("reauth")) {
      const res = NextResponse.next();
      res.cookies.delete("refresh_token");
      res.cookies.delete("access_token");
      return res;
    }

    const isVerifyPath = pathname === ROUTES.VERIFY || pathname.startsWith(`${ROUTES.VERIFY}/`);
    const hasOptIn = searchParams.has("token") || searchParams.has("type") || isVerifyPath;

    if (!hasOptIn) {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify",
  ],
};
