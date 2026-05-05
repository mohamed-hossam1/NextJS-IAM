import { NextResponse, type NextRequest } from "next/server";
import { getCookieCache } from "better-auth/cookies";

import { ROUTES } from "@/constants/routes";
import { auth, ROLE } from "@/lib/auth/auth";


const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
] as const;

const ADMIN_PREFIXES = [ROUTES.ADMIN] as const;
const PROTECTED_PREFIXES = [ROUTES.DASHBOARD, ...ADMIN_PREFIXES] as const;
const AUTH_PREFIXES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOTPASSWORD,
  ROUTES.RESETPASSWORD,
  ROUTES.VERIFY,
] as const;

const REAUTH_PARAM = "reauth";
const ADMIN_ROLE = ROLE.ADMIN;

function isUnder(pathname: string, prefixes: readonly string[]): boolean {
  for (const prefix of prefixes) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return true;
    }
  }
  return false;
}

function hasSessionCookie(request: NextRequest): boolean {
  for (const name of SESSION_COOKIE_NAMES) {
    if (request.cookies.get(name)?.value) return true;
  }
  return false;
}

function clearSessionCookies(response: NextResponse): NextResponse {
  for (const name of SESSION_COOKIE_NAMES) {
    response.cookies.delete(name);
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const protectedRoute = isUnder(pathname, PROTECTED_PREFIXES);
  const authRoute = isUnder(pathname, AUTH_PREFIXES);
  if (!protectedRoute && !authRoute) {
    return NextResponse.next();
  }

  const isAuthed = hasSessionCookie(request);

  if (protectedRoute && !isAuthed) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthed && isUnder(pathname, ADMIN_PREFIXES)) {
    const cached = await getCookieCache(request, {
      secret: process.env.BETTER_AUTH_SECRET,
    });
    let role = cached?.user?.role;

    if (!cached) {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      role = session?.user?.role;
    }

    if (role !== ADMIN_ROLE) {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
    }
  }

  if (authRoute && isAuthed) {
    if (searchParams.has(REAUTH_PARAM)) {
      const fetchSite = request.headers.get("sec-fetch-site");
      const isTrustedNavigation =
        !fetchSite || fetchSite === "same-origin" || fetchSite === "none";
      if (!isTrustedNavigation) {
        return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
      }
      return clearSessionCookies(NextResponse.next());
    }

    const hasOptIn =
      searchParams.has("token") ||
      searchParams.has("type") ||
      pathname.startsWith(ROUTES.VERIFY);
    if (!hasOptIn) {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify",
  ],
};
