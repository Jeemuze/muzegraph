import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const defaultLocale = "id";
const locales = ["id", "en"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteksi route /admin — cek session cookie
  if (pathname.startsWith("/admin")) {
    const sessionCookie =
      request.cookies.get("authjs.session-token") ??
      request.cookies.get("__Secure-authjs.session-token");

    if (!sessionCookie?.value) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Skip locale redirect for auth/dashboard routes
  if (pathname.startsWith("/login") || pathname.startsWith("/forgot-password") || pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // i18n: if path has locale prefix, let it through
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // i18n: redirect paths without locale to default locale
  return NextResponse.redirect(
    new URL(`/${defaultLocale}${pathname}`, request.url)
  );
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
