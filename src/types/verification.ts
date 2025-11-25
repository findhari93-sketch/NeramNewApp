/**
 * Email Verification State Machine Types
 *
 * This file defines the type-safe state machine for email verification flows.
 */

export type VerificationState =
  | { type: "idle" }
  | { type: "pending"; email: string; sentAt: number }
  | { type: "verified"; email: string }
  | { type: "expired"; email: string; lastSentAt: number };

export interface VerificationConfig {
  maxResendAttempts: number;
  initialCooldown: number; // seconds
  maxCooldown: number; // seconds
}

export const DEFAULT_VERIFICATION_CONFIG: VerificationConfig = {
  maxResendAttempts: 5,
  initialCooldown: 20,
  maxCooldown: 300, // 5 minutes
};

/**
 * Calculate exponential backoff delay for resend attempts
 * Formula: min(initialDelay * 2^attempts, maxDelay)
 */
export const getResendDelay = (
  attempts: number,
  config = DEFAULT_VERIFICATION_CONFIG
): number => {
  const delay = config.initialCooldown * Math.pow(2, attempts);
  return Math.min(delay, config.maxCooldown);
};

/**
 * Check if verification has expired (30 minutes since last send)
 */
export const isVerificationExpired = (sentAt: number): boolean => {
  const EXPIRATION_MS = 30 * 60 * 1000; // 30 minutes
  return Date.now() - sentAt > EXPIRATION_MS;
};
