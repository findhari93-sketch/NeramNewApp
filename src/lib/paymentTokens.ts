/**
 * Server-side utility for generating payment tokens.
 * Import this in API routes when you need to create a payment link.
 *
 * Example usage:
 * ```typescript
 * import { generatePaymentToken } from "@/lib/paymentTokens";
 *
 * const token = generatePaymentToken("firebase_uid_123", 5000); // ₹5000, 24h expiry
 * const paymentUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/pay?token=${token}`;
 * // Send paymentUrl via email to user
 * ```
 */

import crypto from "crypto";

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

/**
 * Generates a payment token for a user to complete payment via /pay?token=XXX
 *
 * @param firebase_uid - The Firebase UID of the user who can use this token
 * @param amount - Payment amount in INR (rupees)
 * @param expiresInMs - Token validity in milliseconds (default: 24 hours)
 * @returns Base64URL-encoded token string
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

/**
 * Decodes a payment token (does NOT verify signature - use /api/payments/validate-token for that)
 *
 * @param token - Base64URL-encoded token
 * @returns Decoded token payload or null if malformed
 */
export function decodePaymentToken(token: string): TokenPayload | null {
  try {
    const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}
