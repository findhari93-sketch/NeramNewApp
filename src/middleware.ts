import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import { shouldRedirect } from "@/lib/canonical";

function validateSessionCookie(req: NextRequest) {
  const cookie = req.cookies.get("neram_session")?.value;
  if (!cookie) return false;
  const [base, signature] = cookie.split(".");
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(base)
      .digest("base64url");
    return signature === expected;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Check for old URLs that should be redirected
  const redirectCheck = shouldRedirect(pathname);
  if (redirectCheck.redirect && redirectCheck.target) {
    const targetUrl = new URL(redirectCheck.target, req.nextUrl.origin);
    return NextResponse.redirect(targetUrl, { status: 301 });
  }

  // Remove query parameters for canonical URLs (except for specific pages like payment callbacks)
  const searchParams = req.nextUrl.searchParams;
  const hasQueryParams = Array.from(searchParams.keys()).length > 0;
  const isSpecialPage =
    pathname.startsWith("/pay") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/dashboard");

  if (hasQueryParams && !isSpecialPage) {
    // Redirect to clean URL without query parameters
    const cleanUrl = new URL(pathname, req.nextUrl.origin);
    return NextResponse.redirect(cleanUrl, { status: 301 });
  }

  // Protected paths check
  const protectedPaths = ["/dashboard"];
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    const ok = validateSessionCookie(req);
    if (!ok) {
      const loginUrl = new URL("/auth/login", req.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
