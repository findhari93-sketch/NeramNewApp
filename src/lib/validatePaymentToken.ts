/**
 * Validate payment tokens received from admin application
 * Supports both JWT tokens (with signature verification) and simple DB tokens
 */

// Client-safe decode (no secret), Server-only verify (uses secret)

export type PaymentTokenPayload = {
  userId: string;
  amount: number;
  type?: string;
  iat?: number;
  exp?: number;
};

function base64UrlToJson<T = any>(b64url: string | null): T | null {
  if (!b64url) return null;
  try {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof window !== "undefined"
        ? atob(b64)
        : Buffer.from(b64, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Decode without verifying signature (safe for client)
export function decodePaymentToken(
  token: string
): { ok: true; payload: PaymentTokenPayload } | { ok: false; error: string } {
  if (!token || typeof token !== "string") {
    return { ok: false, error: "Missing token" };
  }
  const [, p] = token.split(".");
  const payload = base64UrlToJson<PaymentTokenPayload>(p || null);
  if (!payload) return { ok: false, error: "Invalid token format" };
  return { ok: true, payload };
}

// Verify on the server (requires secret). Do not call from client.
export async function verifyPaymentTokenServer(
  token: string
): Promise<
  { ok: true; payload: PaymentTokenPayload } | { ok: false; error: string }
> {
  if (typeof window !== "undefined") {
    // Guard: never verify with secret on client
    return { ok: false, error: "SERVER_ONLY" };
  }
  const secret = process.env.PAYMENT_TOKEN_SECRET;
  if (!secret) {
    // Do not log in client; this runs only on server
    return { ok: false, error: "PAYMENT_TOKEN_SECRET not configured" };
  }
  // Dynamic import to avoid bundling in client and keep ESM
  const { default: jwt } = await import("jsonwebtoken");
  try {
    const decoded = jwt.verify(token, secret) as PaymentTokenPayload;
    return { ok: true, payload: decoded };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Token verify failed" };
  }
}
