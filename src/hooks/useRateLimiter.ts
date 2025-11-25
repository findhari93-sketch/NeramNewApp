/**
 * Rate Limiter Hook
 *
 * Provides client-side rate limiting to prevent abuse and brute-force attacks.
 * Tracks attempts within a sliding time window and enforces limits.
 */

import { useState, useCallback, useEffect, useRef } from "react";

interface RateLimiterConfig {
  /** Maximum number of attempts allowed within the time window */
  maxAttempts: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Storage key for persisting attempts across page reloads */
  storageKey?: string;
  /** Enable localStorage persistence (default: true) */
  persist?: boolean;
}

interface RateLimiterReturn {
  /** Check if currently rate limited */
  isRateLimited: () => boolean;
  /** Record a new attempt */
  recordAttempt: () => void;
  /** Get remaining attempts before rate limit */
  remainingAttempts: () => number;
  /** Get time until rate limit expires (ms) */
  timeUntilReset: () => number;
  /** Reset all attempts */
  reset: () => void;
  /** Get all attempt timestamps */
  getAttempts: () => number[];
}

/**
 * Rate limiter hook using sliding window algorithm
 *
 * @example
 * ```tsx
 * const loginLimiter = useRateLimiter({
 *   maxAttempts: 5,
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   storageKey: 'login_attempts',
 * });
 *
 * const handleLogin = async () => {
 *   if (loginLimiter.isRateLimited()) {
 *     const minutes = Math.ceil(loginLimiter.timeUntilReset() / 60000);
 *     setError(`Too many attempts. Try again in ${minutes} minutes.`);
 *     return;
 *   }
 *
 *   loginLimiter.recordAttempt();
 *   // ... proceed with login
 * };
 * ```
 */
export const useRateLimiter = (
  config: RateLimiterConfig
): RateLimiterReturn => {
  const { maxAttempts, windowMs, storageKey, persist = true } = config;

  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial attempts from localStorage if persistence enabled
  const getInitialAttempts = useCallback((): number[] => {
    if (!persist || !storageKey || typeof window === "undefined") {
      return [];
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return [];

      const attempts = JSON.parse(stored) as number[];

      // Filter out expired attempts
      const now = Date.now();
      const validAttempts = attempts.filter(
        (timestamp) => now - timestamp < windowMs
      );

      return validAttempts;
    } catch (error) {
      console.warn(
        "[useRateLimiter] Failed to load attempts from storage:",
        error
      );
      return [];
    }
  }, [persist, storageKey, windowMs]);

  const [attempts, setAttempts] = useState<number[]>(getInitialAttempts);

  // Persist attempts to localStorage
  const persistAttempts = useCallback(
    (attemptsList: number[]) => {
      if (!persist || !storageKey || typeof window === "undefined") {
        return;
      }

      try {
        localStorage.setItem(storageKey, JSON.stringify(attemptsList));
      } catch (error) {
        console.warn("[useRateLimiter] Failed to persist attempts:", error);
      }
    },
    [persist, storageKey]
  );

  // Clean up expired attempts
  const cleanupExpiredAttempts = useCallback(() => {
    const now = Date.now();
    setAttempts((prev) => {
      const validAttempts = prev.filter(
        (timestamp) => now - timestamp < windowMs
      );

      // Only update if something changed
      if (validAttempts.length !== prev.length) {
        persistAttempts(validAttempts);
        return validAttempts;
      }

      return prev;
    });
  }, [windowMs, persistAttempts]);

  // Set up automatic cleanup interval
  useEffect(() => {
    // Clean up immediately on mount
    cleanupExpiredAttempts();

    // Schedule periodic cleanup (every minute)
    cleanupTimerRef.current = setInterval(cleanupExpiredAttempts, 60000);

    return () => {
      if (cleanupTimerRef.current) {
        clearInterval(cleanupTimerRef.current);
      }
    };
  }, [cleanupExpiredAttempts]);

  const isRateLimited = useCallback((): boolean => {
    const now = Date.now();
    const recentAttempts = attempts.filter(
      (timestamp) => now - timestamp < windowMs
    );
    return recentAttempts.length >= maxAttempts;
  }, [attempts, maxAttempts, windowMs]);

  const recordAttempt = useCallback(() => {
    const now = Date.now();
    setAttempts((prev) => {
      const newAttempts = [...prev, now];
      persistAttempts(newAttempts);
      return newAttempts;
    });
  }, [persistAttempts]);

  const remainingAttempts = useCallback((): number => {
    const now = Date.now();
    const recentAttempts = attempts.filter(
      (timestamp) => now - timestamp < windowMs
    );
    return Math.max(0, maxAttempts - recentAttempts.length);
  }, [attempts, maxAttempts, windowMs]);

  const timeUntilReset = useCallback((): number => {
    if (attempts.length === 0) return 0;

    const now = Date.now();
    const oldestRelevantAttempt = attempts
      .filter((timestamp) => now - timestamp < windowMs)
      .sort((a, b) => a - b)[0];

    if (!oldestRelevantAttempt) return 0;

    const resetTime = oldestRelevantAttempt + windowMs;
    return Math.max(0, resetTime - now);
  }, [attempts, windowMs]);

  const reset = useCallback(() => {
    setAttempts([]);
    if (persist && storageKey && typeof window !== "undefined") {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.warn("[useRateLimiter] Failed to clear storage:", error);
      }
    }
  }, [persist, storageKey]);

  const getAttempts = useCallback((): number[] => {
    return [...attempts];
  }, [attempts]);

  return {
    isRateLimited,
    recordAttempt,
    remainingAttempts,
    timeUntilReset,
    reset,
    getAttempts,
  };
};

/**
 * Predefined rate limiter configurations for common use cases
 */
export const RATE_LIMIT_CONFIGS = {
  /** 5 attempts per 15 minutes - for login */
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    storageKey: "auth_login_attempts",
  },
  /** 3 attempts per hour - for signup */
  SIGNUP: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000,
    storageKey: "auth_signup_attempts",
  },
  /** 5 attempts per hour - for email verification resend */
  EMAIL_RESEND: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000,
    storageKey: "auth_email_resend_attempts",
  },
  /** 3 attempts per day - for password reset */
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 24 * 60 * 60 * 1000,
    storageKey: "auth_password_reset_attempts",
  },
} as const;

/**
 * Format time remaining for display
 */
export const formatTimeRemaining = (ms: number): string => {
  if (ms === 0) return "0 seconds";

  const seconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  return `${seconds} second${seconds > 1 ? "s" : ""}`;
};
