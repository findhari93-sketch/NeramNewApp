/**
 * Centralized Authentication Error Handling
 *
 * Provides consistent error handling, logging, and user-friendly messages
 * across all authentication flows.
 */

import type { FirebaseError } from "firebase/app";

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public recoverable: boolean = true,
    public action?: "retry" | "contact_support" | "redirect_support"
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Map Firebase errors to user-friendly AuthError instances
 */
const mapFirebaseError = (error: FirebaseError): AuthError => {
  const errorMap: Record<
    string,
    { message: string; recoverable: boolean; action?: AuthError["action"] }
  > = {
    // Authentication errors
    "auth/invalid-email": {
      message: "Please enter a valid email address.",
      recoverable: true,
    },
    "auth/user-disabled": {
      message: "This account has been disabled. Please contact support.",
      recoverable: false,
      action: "contact_support",
    },
    "auth/user-not-found": {
      message:
        "No account found with this email. Please sign up or check your email.",
      recoverable: true,
    },
    "auth/wrong-password": {
      message: "Incorrect password. Please try again or reset your password.",
      recoverable: true,
    },
    "auth/invalid-credential": {
      message: "Invalid email or password. Please try again.",
      recoverable: true,
    },
    "auth/email-already-in-use": {
      message: "This email is already registered. Please sign in instead.",
      recoverable: true,
    },
    "auth/weak-password": {
      message:
        "Password is too weak. Use at least 8 characters with letters and numbers.",
      recoverable: true,
    },
    "auth/operation-not-allowed": {
      message: "This sign-in method is not enabled. Please contact support.",
      recoverable: false,
      action: "contact_support",
    },
    "auth/account-exists-with-different-credential": {
      message:
        "An account already exists with this email using a different sign-in method.",
      recoverable: true,
    },
    "auth/credential-already-in-use": {
      message: "This credential is already linked to another account.",
      recoverable: false,
    },
    "auth/requires-recent-login": {
      message: "Please sign in again to complete this action.",
      recoverable: true,
      action: "retry",
    },
    "auth/too-many-requests": {
      message: "Too many failed attempts. Please try again in a few minutes.",
      recoverable: true,
    },
    "auth/popup-blocked": {
      message: "Sign-in popup was blocked. Please allow popups for this site.",
      recoverable: true,
    },
    "auth/popup-closed-by-user": {
      message: "Sign-in cancelled. Please try again.",
      recoverable: true,
    },
    "auth/network-request-failed": {
      message: "Network error. Please check your connection and try again.",
      recoverable: true,
      action: "retry",
    },
    "auth/missing-password": {
      message: "Please enter a password.",
      recoverable: true,
    },
    "auth/internal-error": {
      message:
        "An unexpected error occurred. Please try again or contact support.",
      recoverable: true,
      action: "contact_support",
    },
  };

  const mapped = errorMap[error.code];

  if (mapped) {
    return new AuthError(
      error.message,
      error.code,
      mapped.message,
      mapped.recoverable,
      mapped.action
    );
  }

  // Unknown Firebase error
  return new AuthError(
    error.message,
    error.code,
    "An authentication error occurred. Please try again.",
    true
  );
};

/**
 * Handle any authentication error and convert to AuthError
 * Also logs to console (can be extended to log to monitoring service)
 */
export const handleAuthError = (error: unknown): AuthError => {
  // Log to console (in production, send to monitoring service like Sentry)
  console.error("[AuthError]", error);

  // TODO: Integrate with monitoring service
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error);
  // }

  // Handle Firebase errors
  if (error && typeof error === "object" && "code" in error) {
    const firebaseError = error as FirebaseError;
    if (firebaseError.code?.startsWith("auth/")) {
      return mapFirebaseError(firebaseError);
    }
  }

  // Handle AuthError instances (already processed)
  if (error instanceof AuthError) {
    return error;
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return new AuthError(
      error.message,
      "UNKNOWN_ERROR",
      error.message || "Something went wrong. Please try again.",
      true
    );
  }

  // Handle unknown errors
  return new AuthError(
    String(error),
    "UNKNOWN_ERROR",
    "Something went wrong. Please try again.",
    true
  );
};

/**
 * User-friendly error messages for common scenarios
 */
export const AUTH_ERROR_MESSAGES = {
  GOOGLE_ALREADY_LINKED:
    'This email is already associated with a Google account. Please use "Continue with Google" or set a password from your profile.',
  PROVIDER_MISMATCH: (providers: string[]) =>
    `This email is already registered with ${providers.join(
      ", "
    )}. Please sign in using that method.`,
  EMAIL_NOT_VERIFIED:
    "Please verify your email before signing in. We just sent you a new verification link.",
  PHONE_REQUIRED: "Phone number is required to complete your profile.",
  PROFILE_INCOMPLETE: "Please complete your profile to continue.",
  VERIFICATION_FAILED:
    "Unable to send verification email. Please check your email address and try again.",
} as const;
