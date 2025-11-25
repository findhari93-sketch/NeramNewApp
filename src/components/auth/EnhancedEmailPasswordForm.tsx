/**
 * Enhanced Email/Password Authentication Form
 *
 * Production-ready form with:
 * - Rate limiting to prevent abuse
 * - Auth flow state machine for better UX
 * - Full accessibility (ARIA labels, screen reader support)
 * - Comprehensive error handling
 */

"use client";

import React, { useState, useEffect, useId } from "react";
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { signInWithEmailOrUsername } from "../../lib/auth/firebaseAuth";
import { validateEmailForAuth } from "../../lib/validation/email";
import { passwordSchema, signInSchema } from "../../lib/auth/validation";
import { authProviderService } from "../../services/authProvider";
import { handleAuthError, AUTH_ERROR_MESSAGES } from "../../utils/authErrors";
import {
  useRateLimiter,
  RATE_LIMIT_CONFIGS,
  formatTimeRemaining,
} from "../../hooks/useRateLimiter";
import {
  announceToScreenReader,
  getAriaDescribedBy,
  ARIA_MESSAGES,
} from "../../utils/accessibility";
import type { AuthFlowState } from "../../types/authFlow";
import {
  getAuthFlowMessage,
  getAuthFlowProgress,
  isLoadingState,
} from "../../types/authFlow";

interface EnhancedEmailPasswordFormProps {
  onSuccess: (idToken: string) => Promise<void>;
  onSignupSuccess?: (email: string) => void;
  onError?: (error: string) => void;
}

export const EnhancedEmailPasswordForm: React.FC<
  EnhancedEmailPasswordFormProps
> = ({ onSuccess, onSignupSuccess, onError }) => {
  const router = useRouter();
  const formId = useId();

  // Form state
  const [form, setForm] = useState({
    identifier: "",
    password: "",
    confirmPassword: "",
  });

  // Auth flow state machine
  const [flowState, setFlowState] = useState<AuthFlowState>({ status: "idle" });

  // UI state
  const [showPassword, setShowPassword] = useState(false);

  // Provider detection state
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [emailProviders, setEmailProviders] = useState<string[] | null>(null);
  const [stagedNewEmail, setStagedNewEmail] = useState(false);

  // Rate limiters
  const loginLimiter = useRateLimiter(RATE_LIMIT_CONFIGS.LOGIN);
  const signupLimiter = useRateLimiter(RATE_LIMIT_CONFIGS.SIGNUP);

  // ARIA IDs
  const identifierAriaIds = getAriaDescribedBy(
    `${formId}-identifier`,
    flowState.status === "error",
    form.identifier.length > 0 && /^\+?\d{10,15}$/.test(form.identifier)
  );

  const passwordAriaIds = getAriaDescribedBy(
    `${formId}-password`,
    flowState.status === "error",
    false
  );

  // Check email providers when identifier changes
  useEffect(() => {
    const value = form.identifier.trim();

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setEmailExists(null);
      setStagedNewEmail(false);
      setEmailProviders(null);
      if (flowState.status === "checking_providers") {
        setFlowState({ status: "idle" });
      }
      return;
    }

    let cancelled = false;

    (async () => {
      setFlowState({ status: "checking_providers", email: value });

      const emailValidation = validateEmailForAuth(value);
      if (!emailValidation.success) {
        if (!cancelled) {
          setFlowState({
            status: "error",
            error: emailValidation.error,
            recoverable: true,
          });
          setEmailExists(null);
          setEmailProviders(null);
        }
        return;
      }

      try {
        const validatedEmail = emailValidation.data.email;
        const providers = await authProviderService.getProviders(
          validatedEmail
        );

        if (cancelled) return;

        setEmailProviders(providers);

        if (providers.length === 0) {
          setEmailExists(false);
          setStagedNewEmail(true);
        } else {
          setEmailExists(true);
          setStagedNewEmail(false);
        }

        setFlowState({ status: "idle" });
      } catch (err) {
        console.error(
          "[EnhancedEmailPasswordForm] Provider check failed:",
          err
        );
        if (!cancelled) {
          setEmailExists(null);
          setStagedNewEmail(false);
          setEmailProviders(null);
          setFlowState({ status: "idle" });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form.identifier, flowState.status]);

  const handleSignup = async (
    validatedEmail: string,
    password: string
  ): Promise<boolean> => {
    try {
      setFlowState({ status: "authenticating", method: "email" });
      announceToScreenReader("Creating your account", "polite");

      const cred = await createUserWithEmailAndPassword(
        auth,
        validatedEmail,
        password
      );

      setFlowState({ status: "sending_verification", email: validatedEmail });
      announceToScreenReader("Sending verification email", "polite");

      let emailSendSuccess = false;
      try {
        const response = await fetch("/api/auth/send-verification-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: validatedEmail }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to send verification email");
        }

        emailSendSuccess = true;
      } catch (emailErr) {
        console.warn(
          "[EnhancedEmailPasswordForm] Verification email failed:",
          emailErr
        );

        try {
          await cred.user.delete();
        } catch (deleteErr) {
          console.error(
            "[EnhancedEmailPasswordForm] Failed to delete user:",
            deleteErr
          );
        }

        throw new Error(
          "Unable to send verification email. Please check your email address and try again."
        );
      }

      if (emailSendSuccess) {
        setFlowState({ status: "creating_session" });

        try {
          const idToken = await cred.user.getIdToken();

          await fetch("/api/auth/set-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });

          await fetch("/api/users/upsert", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({}),
          });
        } catch (upsertErr) {
          console.warn(
            "[EnhancedEmailPasswordForm] Upsert after signup failed:",
            upsertErr
          );
        }
      }

      await signOut(auth);

      announceToScreenReader(ARIA_MESSAGES.SIGNUP_SUCCESS, "assertive");

      if (onSignupSuccess) {
        onSignupSuccess(validatedEmail);
      } else {
        router.replace(
          `/auth/login?notice=verify_email_sent&email=${encodeURIComponent(
            validatedEmail
          )}`
        );
      }

      return true;
    } catch (err) {
      const authError = handleAuthError(err);
      setFlowState({
        status: "error",
        error: authError.userMessage,
        recoverable: authError.recoverable,
      });
      announceToScreenReader(authError.userMessage, "assertive");
      if (onError) onError(authError.userMessage);
      return false;
    }
  };

  const handleSignin = async (
    identifier: string,
    password: string
  ): Promise<boolean> => {
    try {
      setFlowState({ status: "authenticating", method: "email" });
      announceToScreenReader("Signing you in", "polite");

      await signInWithEmailOrUsername(identifier, password);
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Sign in failed - no user");
      }

      if (!user.emailVerified) {
        const providers = await authProviderService.getProviders(
          user.email || identifier
        );

        if (providers.includes("google.com")) {
          const error = AUTH_ERROR_MESSAGES.GOOGLE_ALREADY_LINKED;
          setFlowState({ status: "error", error, recoverable: true });
          announceToScreenReader(error, "assertive");
          if (onError) onError(error);
          await signOut(auth);
          return false;
        }

        await fetch("/api/auth/send-verification-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email || identifier }),
        }).catch(console.warn);

        await signOut(auth);

        router.replace(
          `/auth/login?notice=verify_email_required&email=${encodeURIComponent(
            user.email || identifier
          )}`
        );
        return false;
      }

      setFlowState({ status: "creating_session" });

      const idToken = await user.getIdToken();

      await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      await fetch("/api/users/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({}),
      });

      setFlowState({ status: "verifying_profile" });
      announceToScreenReader(ARIA_MESSAGES.LOGIN_SUCCESS, "assertive");

      await onSuccess(idToken);
      return true;
    } catch (err) {
      const authError = handleAuthError(err);
      setFlowState({
        status: "error",
        error: authError.userMessage,
        recoverable: authError.recoverable,
      });
      announceToScreenReader(authError.userMessage, "assertive");
      if (onError) onError(authError.userMessage);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const identifier = form.identifier.trim();
    const password = form.password;

    // Check rate limits
    const limiter = emailExists === false ? signupLimiter : loginLimiter;

    if (limiter.isRateLimited()) {
      const timeRemaining = formatTimeRemaining(limiter.timeUntilReset());
      const error = `Too many attempts. Please try again in ${timeRemaining}.`;

      setFlowState({
        status: "rate_limited",
        resetTime: Date.now() + limiter.timeUntilReset(),
      });
      announceToScreenReader(ARIA_MESSAGES.RATE_LIMITED, "assertive");
      if (onError) onError(error);
      return;
    }

    // Record attempt
    limiter.recordAttempt();

    setFlowState({ status: "checking_credentials" });

    try {
      const validation = signInSchema.safeParse({ identifier, password });
      if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message || "Invalid input");
      }

      if (emailExists === false && stagedNewEmail) {
        const emailValidation = validateEmailForAuth(identifier);
        if (!emailValidation.success) {
          throw new Error(emailValidation.error);
        }

        const validatedEmail = emailValidation.data.email;
        const providers = await authProviderService.getProviders(
          validatedEmail
        );

        if (providers.length > 0) {
          if (providers.includes("google.com")) {
            throw new Error(AUTH_ERROR_MESSAGES.GOOGLE_ALREADY_LINKED);
          } else {
            throw new Error(AUTH_ERROR_MESSAGES.PROVIDER_MISMATCH(providers));
          }
        }

        const pwValidation = passwordSchema.safeParse(password);
        if (!pwValidation.success) {
          throw new Error(
            pwValidation.error.issues[0]?.message ||
              "Password validation failed"
          );
        }

        if (password !== form.confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        await handleSignup(validatedEmail, password);
      } else {
        await handleSignin(identifier, password);
      }
    } catch (err) {
      const authError = handleAuthError(err);
      setFlowState({
        status: "error",
        error: authError.userMessage,
        recoverable: authError.recoverable,
      });
      announceToScreenReader(authError.userMessage, "assertive");
      if (onError) onError(authError.userMessage);
    }
  };

  const isLoading = isLoadingState(flowState);
  const showConfirmPassword = stagedNewEmail && emailExists === false;
  const progress = getAuthFlowProgress(flowState);

  const buttonLabel =
    flowState.status === "checking_providers"
      ? "Checking account..."
      : flowState.status === "checking_credentials"
      ? "Verifying..."
      : isLoading
      ? getAuthFlowMessage(flowState)
      : emailExists === false && stagedNewEmail
      ? "Sign Up"
      : "Sign In";

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      role="form"
      aria-label="Authentication form"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1.5, sm: 1 },
        position: "relative",
      }}
    >
      {/* Progress bar */}
      {isLoading && progress > 0 && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            position: "absolute",
            top: -8,
            left: 0,
            right: 0,
            borderRadius: 1,
          }}
        />
      )}

      {/* Email/Username Field */}
      <TextField
        id={`${formId}-identifier`}
        size="small"
        label="Email or Username"
        value={form.identifier}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, identifier: e.target.value }))
        }
        fullWidth
        required
        disabled={isLoading}
        aria-label="Email address or username"
        aria-required="true"
        aria-invalid={flowState.status === "error"}
        aria-describedby={identifierAriaIds.combined}
        sx={{
          "& .MuiInputBase-root": {
            fontSize: { xs: "0.875rem", sm: "0.875rem" },
            height: { xs: "40px", sm: "40px" },
          },
        }}
        helperText={
          form.identifier && /^\+?\d{10,15}$/.test(form.identifier)
            ? "Phone number detected - use phone OTP option below"
            : ""
        }
      />

      {/* Password Field */}
      {(stagedNewEmail ||
        emailProviders === null ||
        emailProviders.length > 0) && (
        <>
          <TextField
            id={`${formId}-password`}
            size="small"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
            fullWidth
            required
            disabled={isLoading}
            aria-label="Password"
            aria-required="true"
            aria-invalid={flowState.status === "error"}
            aria-describedby={passwordAriaIds.combined}
            sx={{
              "& .MuiInputBase-root": {
                fontSize: { xs: "0.875rem", sm: "0.875rem" },
                height: { xs: "40px", sm: "40px" },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    disabled={isLoading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Confirm Password Field */}
          {showConfirmPassword && (
            <TextField
              id={`${formId}-confirm-password`}
              size="small"
              label="Confirm password"
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              fullWidth
              required
              disabled={isLoading}
              aria-label="Confirm password"
              aria-required="true"
              sx={{
                "& .MuiInputBase-root": {
                  fontSize: { xs: "0.875rem", sm: "0.875rem" },
                  height: { xs: "40px", sm: "40px" },
                },
              }}
            />
          )}

          {/* Forgot Password Link */}
          {emailExists !== false && (
            <Button
              variant="text"
              size="small"
              onClick={() => {
                const target = form.identifier.trim();
                const qp = target ? `?email=${encodeURIComponent(target)}` : "";
                router.push(`/auth/forgot${qp}`);
              }}
              disabled={isLoading}
              sx={{ alignSelf: "flex-end" }}
            >
              Forgot password?
            </Button>
          )}
        </>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        disabled={isLoading || flowState.status === "rate_limited"}
        fullWidth
        aria-label={buttonLabel}
        sx={{
          py: { xs: 1.5, sm: 1 },
          fontSize: { xs: "1rem", sm: "0.875rem" },
          gap: 1,
        }}
      >
        {isLoading && <CircularProgress size={20} color="inherit" />}
        {buttonLabel}
      </Button>

      {/* Error/Status Message */}
      {flowState.status === "error" && (
        <Alert
          id={identifierAriaIds.error}
          severity="error"
          role="alert"
          aria-live="assertive"
          onClose={() => setFlowState({ status: "idle" })}
        >
          {flowState.error}
        </Alert>
      )}

      {flowState.status === "rate_limited" && (
        <Alert severity="warning" role="alert" aria-live="assertive">
          Too many attempts. Please try again in{" "}
          {formatTimeRemaining(flowState.resetTime - Date.now())}.
        </Alert>
      )}
    </Box>
  );
};
