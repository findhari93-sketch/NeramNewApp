/**
 * Accessibility Utilities
 *
 * Helper functions for improving accessibility including screen reader
 * announcements and focus management.
 */

/**
 * Announce a message to screen readers
 * Creates a temporary live region for ARIA announcements
 */
export const announceToScreenReader = (
  message: string,
  priority: "polite" | "assertive" = "polite"
): void => {
  if (typeof document === "undefined") return;

  // Create announcement element
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only"; // Screen reader only class
  announcement.textContent = message;

  // Add to DOM
  document.body.appendChild(announcement);

  // Remove after announcement (give screen readers time to read)
  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.parentNode.removeChild(announcement);
    }
  }, 1000);
};

/**
 * Move focus to an element by ID
 * Useful for managing focus after state changes
 */
export const focusElement = (elementId: string, delay = 0): void => {
  if (typeof document === "undefined") return;

  const focusTarget = () => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();

      // If element is not naturally focusable, add tabindex
      if (!element.hasAttribute("tabindex")) {
        element.setAttribute("tabindex", "-1");
      }
    }
  };

  if (delay > 0) {
    setTimeout(focusTarget, delay);
  } else {
    focusTarget();
  }
};

/**
 * Trap focus within a container (for modals/dialogs)
 */
export const createFocusTrap = (containerId: string): (() => void) => {
  if (typeof document === "undefined") {
    return () => {};
  }

  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Get all focusable elements
  const getFocusableElements = (): HTMLElement[] => {
    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ];

    const elements = container.querySelectorAll<HTMLElement>(
      focusableSelectors.join(", ")
    );

    return Array.from(elements);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Shift + Tab on first element -> focus last
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
    // Tab on last element -> focus first
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  // Add event listener
  container.addEventListener("keydown", handleKeyDown);

  // Focus first element
  const focusableElements = getFocusableElements();
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }

  // Return cleanup function
  return () => {
    container.removeEventListener("keydown", handleKeyDown);
  };
};

/**
 * Get unique ID for ARIA labeling
 * Ensures IDs are unique even with multiple instances
 */
let idCounter = 0;
export const generateAriaId = (prefix: string): string => {
  idCounter++;
  return `${prefix}-${idCounter}-${Date.now()}`;
};

/**
 * ARIA announcement presets for common auth scenarios
 */
export const ARIA_MESSAGES = {
  LOGIN_SUCCESS: "Successfully signed in. Redirecting to your dashboard.",
  LOGIN_FAILED: "Sign in failed. Please check your credentials and try again.",
  SIGNUP_SUCCESS:
    "Account created successfully. Please check your email to verify your account.",
  SIGNUP_FAILED: "Failed to create account. Please try again.",
  EMAIL_SENT:
    "Verification email sent. Please check your inbox and spam folder.",
  PASSWORD_RESET_SENT: "Password reset email sent. Please check your inbox.",
  RATE_LIMITED: "Too many attempts. Please wait before trying again.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  PROFILE_UPDATED: "Profile updated successfully.",
  PHONE_VERIFIED: "Phone number verified successfully.",
  ERROR_NETWORK: "Network error. Please check your connection and try again.",
  ERROR_UNKNOWN:
    "An unexpected error occurred. Please try again or contact support.",
} as const;

/**
 * Create ARIA describedby IDs for form fields
 */
export interface AriaDescribedBy {
  error?: string;
  help?: string;
  combined: string | undefined;
}

export const getAriaDescribedBy = (
  fieldName: string,
  hasError: boolean,
  hasHelp: boolean
): AriaDescribedBy => {
  const errorId = hasError ? `${fieldName}-error` : undefined;
  const helpId = hasHelp ? `${fieldName}-help` : undefined;

  const ids = [errorId, helpId].filter(Boolean);

  return {
    error: errorId,
    help: helpId,
    combined: ids.length > 0 ? ids.join(" ") : undefined,
  };
};
