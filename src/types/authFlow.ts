/**
 * Authentication Flow State Machine Types
 *
 * Defines type-safe states for the authentication flow to provide
 * clear loading states and better UX.
 */

export type AuthFlowState =
  | { status: "idle" }
  | { status: "checking_credentials" }
  | { status: "checking_providers"; email: string }
  | { status: "authenticating"; method: "email" | "google" | "phone" }
  | { status: "sending_verification"; email: string }
  | { status: "verifying_profile" }
  | { status: "creating_session" }
  | { status: "redirecting"; target?: string }
  | { status: "error"; error: string; recoverable: boolean }
  | { status: "rate_limited"; resetTime: number };

/**
 * Get user-friendly loading message for current auth flow state
 */
export const getAuthFlowMessage = (state: AuthFlowState): string => {
  switch (state.status) {
    case "idle":
      return "";
    case "checking_credentials":
      return "Verifying your credentials...";
    case "checking_providers":
      return "Checking account...";
    case "authenticating":
      if (state.method === "google") return "Signing in with Google...";
      if (state.method === "phone") return "Verifying phone number...";
      return "Signing you in...";
    case "sending_verification":
      return "Sending verification email...";
    case "verifying_profile":
      return "Setting up your profile...";
    case "creating_session":
      return "Creating your session...";
    case "redirecting":
      return "Almost there...";
    case "error":
      return state.error;
    case "rate_limited":
      return "Too many attempts. Please wait before trying again.";
    default:
      return "Processing...";
  }
};

/**
 * Get progress percentage for current state (for progress bars)
 */
export const getAuthFlowProgress = (state: AuthFlowState): number => {
  switch (state.status) {
    case "idle":
      return 0;
    case "checking_credentials":
    case "checking_providers":
      return 10;
    case "authenticating":
      return 30;
    case "sending_verification":
      return 50;
    case "verifying_profile":
      return 70;
    case "creating_session":
      return 85;
    case "redirecting":
      return 95;
    case "error":
    case "rate_limited":
      return 0;
    default:
      return 0;
  }
};

/**
 * Check if state represents a loading state
 */
export const isLoadingState = (state: AuthFlowState): boolean => {
  return !["idle", "error", "rate_limited"].includes(state.status);
};

/**
 * Check if state represents an error state
 */
export const isErrorState = (state: AuthFlowState): boolean => {
  return state.status === "error" || state.status === "rate_limited";
};
