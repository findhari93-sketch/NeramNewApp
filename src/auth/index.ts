/**
 * Authentication Module Barrel Export
 *
 * Central export point for all authentication-related components, hooks, and utilities.
 * Import from this file to use the new modular auth architecture.
 */

// Components
export { VerificationPrompt } from "./components/auth/VerificationPrompt";
export { EmailPasswordForm } from "./components/auth/EmailPasswordForm";

// Hooks
export { useEmailVerification } from "./hooks/useEmailVerification";
export { useAuthRedirect } from "./hooks/useAuthRedirect";

// Services
export {
  authProviderService,
  AuthProviderService,
} from "./services/authProvider";

// Types
export type {
  VerificationState,
  VerificationConfig,
} from "./types/verification";

// Utilities
export {
  handleAuthError,
  AuthError,
  AUTH_ERROR_MESSAGES,
} from "./utils/authErrors";

// Constants
export {
  DEFAULT_VERIFICATION_CONFIG,
  getResendDelay,
  isVerificationExpired,
} from "./types/verification";
