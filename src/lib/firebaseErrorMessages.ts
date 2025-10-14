// Maps Firebase Auth error codes to user-friendly messages.
export function friendlyFirebaseError(err: unknown): string {
  try {
    if (!err || typeof err !== "object")
      return "Something went wrong. Please try again.";
    const anyErr = err as { code?: string; message?: string };
    const code = anyErr.code || "";
    switch (code) {
      case "auth/provider-already-linked":
      case "auth/credential-already-in-use":
        return "Phone number already exists. Please sign in with that account or use a different phone number.";
      case "auth/invalid-phone-number":
        return "Enter a valid phone number.";
      case "auth/invalid-verification-code":
        return "Invalid verification code. Please check the code and try again.";
      case "auth/code-expired":
        return "Verification code expired. Request a new code and try again.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a while and try again.";
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return "Popup closed. Please try again.";
      case "auth/popup-blocked":
        return "Popup blocked by your browser. Allow popups or use the fallback option.";
      default:
        // If the message exists but looks generic, don't expose raw firebase text.
        return "Something went wrong. Please try again.";
    }
  } catch {
    return "Something went wrong. Please try again.";
  }
}
