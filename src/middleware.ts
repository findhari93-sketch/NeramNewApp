import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

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
  const protectedPaths = ["/dashboard"];
  if (protectedPaths.some((p) => req.nextUrl.pathname.startsWith(p))) {
    const ok = validateSessionCookie(req);
    if (!ok) {
      const loginUrl = new URL("/auth/login", req.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
