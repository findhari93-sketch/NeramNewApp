/**
 * Email Verification Hook
 *
 * Manages email verification state machine with exponential backoff
 * for resends and proper state transitions.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import {
  VerificationState,
  VerificationConfig,
  DEFAULT_VERIFICATION_CONFIG,
  getResendDelay,
  isVerificationExpired,
} from "../types/verification";
import { handleAuthError } from "../utils/authErrors";

interface UseEmailVerificationReturn {
  state: VerificationState;
  resendAttempts: number;
  cooldownSeconds: number;
  canResend: boolean;
  isLoading: boolean;
  error: string | null;
  sendVerificationEmail: (email: string) => Promise<boolean>;
  resendVerificationEmail: () => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export const useEmailVerification = (
  config: VerificationConfig = DEFAULT_VERIFICATION_CONFIG
): UseEmailVerificationReturn => {
  const [state, setState] = useState<VerificationState>({ type: "idle" });
  const [resendAttempts, setResendAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  // Start cooldown timer
  const startCooldown = useCallback(
    (attempts: number) => {
      const delay = getResendDelay(attempts, config);
      setCooldownSeconds(delay);

      // Clear existing timer
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }

      // Start new timer
      cooldownTimerRef.current = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            if (cooldownTimerRef.current) {
              clearInterval(cooldownTimerRef.current);
              cooldownTimerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [config]
  );

  // Check if verification has expired
  useEffect(() => {
    if (state.type === "pending") {
      if (isVerificationExpired(state.sentAt)) {
        setState({
          type: "expired",
          email: state.email,
          lastSentAt: state.sentAt,
        });
      }
    }
  }, [state]);

  // Send verification email
  const sendVerificationEmail = useCallback(
    async (email: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Try custom branded email first
        const response = await fetch("/api/auth/send-verification-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to send verification email");
        }

        // Success - update state
        setState({
          type: "pending",
          email,
          sentAt: Date.now(),
        });

        setResendAttempts(0);
        startCooldown(0);

        return true;
      } catch (err) {
        const authError = handleAuthError(err);
        setError(authError.userMessage);

        setState({ type: "idle" });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [startCooldown]
  );

  // Resend verification email
  const resendVerificationEmail = useCallback(async (): Promise<boolean> => {
    if (state.type !== "pending" && state.type !== "expired") {
      setError("No pending verification to resend");
      return false;
    }

    if (resendAttempts >= config.maxResendAttempts) {
      setError(
        `Maximum resend attempts (${config.maxResendAttempts}) reached. Please contact support.`
      );
      return false;
    }

    if (cooldownSeconds > 0) {
      setError(`Please wait ${cooldownSeconds} seconds before resending`);
      return false;
    }

    const email = state.email;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to resend verification email");
      }

      // Success - update state
      const newAttempts = resendAttempts + 1;
      setResendAttempts(newAttempts);

      setState({
        type: "pending",
        email,
        sentAt: Date.now(),
      });

      startCooldown(newAttempts);

      return true;
    } catch (err) {
      const authError = handleAuthError(err);
      setError(authError.userMessage);

      return false;
    } finally {
      setIsLoading(false);
    }
  }, [
    state,
    resendAttempts,
    cooldownSeconds,
    config.maxResendAttempts,
    startCooldown,
  ]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setState({ type: "idle" });
    setResendAttempts(0);
    setCooldownSeconds(0);
    setError(null);
    setIsLoading(false);

    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
  }, []);

  const canResend =
    (state.type === "pending" || state.type === "expired") &&
    resendAttempts < config.maxResendAttempts &&
    cooldownSeconds === 0 &&
    !isLoading;

  return {
    state,
    resendAttempts,
    cooldownSeconds,
    canResend,
    isLoading,
    error,
    sendVerificationEmail,
    resendVerificationEmail,
    clearError,
    reset,
  };
};
