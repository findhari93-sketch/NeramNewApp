export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * POST /api/payments/validate-token
 *
 * Validates a payment token from the URL (/pay?token=XXX).
 *
 * Token format: base64url(firebase_uid:amount:expiresAt:signature)
 * - firebase_uid: user who can use this token
 * - amount: payment amount in INR
 * - expiresAt: Unix timestamp (ms)
 * - signature: HMAC SHA256 of "uid:amount:expiresAt" with TOKEN_SECRET
 *
 * Returns:
 * - { valid: true, firebase_uid, amount, expiresAt } if valid
 * - { valid: false, error: "expired" | "invalid_signature" | "malformed" | "used" }
 */

const TOKEN_SECRET =
  process.env.PAYMENT_TOKEN_SECRET ||
  process.env.SESSION_SECRET ||
  "fallback-dev-secret";

interface TokenPayload {
  firebase_uid: string;
  amount: number;
  expiresAt: number;
  signature: string;
  usedAt?: string; // ISO timestamp when token was used
}

function verifyTokenSignature(
  uid: string,
  amount: number,
  expiresAt: number,
  signature: string
): boolean {
  const payload = `${uid}:${amount}:${expiresAt}`;
  const expected = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(payload)
    .digest("hex");
  return expected === signature;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token: string | undefined = body?.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        {
          valid: false,
          error: "malformed",
          hint: "Missing token in request body",
        },
        { status: 400 }
      );
    }

    // Decode token: base64url → JSON
    let decoded: TokenPayload;
    try {
      const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
      const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
      decoded = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { valid: false, error: "malformed", hint: "Token decode failed" },
        { status: 400 }
      );
    }

    const { firebase_uid, amount, expiresAt, signature, usedAt } = decoded;

    if (
      !firebase_uid ||
      typeof amount !== "number" ||
      typeof expiresAt !== "number" ||
      !signature
    ) {
      return NextResponse.json(
        { valid: false, error: "malformed", hint: "Incomplete token payload" },
        { status: 400 }
      );
    }

    // Check signature
    if (!verifyTokenSignature(firebase_uid, amount, expiresAt, signature)) {
      return NextResponse.json(
        { valid: false, error: "invalid_signature" },
        { status: 401 }
      );
    }

    // Check expiry
    if (Date.now() > expiresAt) {
      return NextResponse.json(
        { valid: false, error: "expired" },
        { status: 400 }
      );
    }

    // Check if already used (stored in token itself for now; can move to DB for stricter enforcement)
    if (usedAt) {
      return NextResponse.json(
        { valid: false, error: "used", usedAt },
        { status: 400 }
      );
    }

    // Token is valid
    return NextResponse.json({
      valid: true,
      firebase_uid,
      amount,
      expiresAt,
    });
  } catch (err: any) {
    console.error("validate-token error:", err);
    return NextResponse.json(
      {
        valid: false,
        error: "server_error",
        hint: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}

/**
 * Utility to generate a payment token (used by other endpoints when sending payment link emails).
 * Export this function for use in other server routes.
 */
export function generatePaymentToken(
  firebase_uid: string,
  amount: number,
  expiresInMs: number = 24 * 60 * 60 * 1000
): string {
  const expiresAt = Date.now() + expiresInMs;
  const payload = `${firebase_uid}:${amount}:${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(payload)
    .digest("hex");

  const tokenPayload: TokenPayload = {
    firebase_uid,
    amount,
    expiresAt,
    signature,
  };

  const jsonStr = JSON.stringify(tokenPayload);
  const base64 = Buffer.from(jsonStr, "utf-8").toString("base64");
  const base64url = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return base64url;
}
