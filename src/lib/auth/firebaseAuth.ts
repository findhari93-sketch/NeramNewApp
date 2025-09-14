// lib/auth/firebaseAuth.ts
import {
  linkWithCredential,
  EmailAuthProvider,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  fetchSignInMethodsForEmail,
  type User,
} from "firebase/auth";
import { auth } from "../firebase";

/**
 * Link email/password to the currently signed-in user (typically phone user)
 */
export async function linkEmailPasswordToCurrentUser(
  email: string,
  password: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is currently signed in");
  }

  const credential = EmailAuthProvider.credential(email, password);
  await linkWithCredential(user, credential);
}

/**
 * Sign in with email/username + password
 * If identifier contains @, treat as email; otherwise resolve username to email first
 */
export async function signInWithEmailOrUsername(
  identifier: string,
  password: string
): Promise<void> {
  let email = identifier;

  // If identifier doesn't contain @, it's a username - resolve to email
  if (!identifier.includes("@")) {
    const response = await fetch("/api/auth/username-to-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: identifier }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Username not found");
      }
      throw new Error("Failed to resolve username");
    }

    const data = await response.json();
    email = data.email;
  }

  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Send email verification to the current user
 */
export async function sendEmailVerificationToCurrentUser(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is currently signed in");
  }

  await sendEmailVerification(user);
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Change password with re-authentication
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is currently signed in");
  }

  // Find email from linked providers
  const email = user.email;
  if (!email) {
    throw new Error("User does not have an email linked");
  }

  // Re-authenticate with current password
  const credential = EmailAuthProvider.credential(email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Update password
  await updatePassword(user, newPassword);
}

/**
 * Get linked sign-in providers for the current user
 */
export async function getLinkedProviders(): Promise<{
  email?: string;
  providers: string[];
}> {
  const user = auth.currentUser;
  if (!user) {
    return { providers: [] };
  }

  const email = user.email;
  const providers: string[] = [];

  // Get provider data from user
  user.providerData.forEach((provider) => {
    providers.push(provider.providerId);
  });

  // Also check what methods are available for email if user has one
  if (email) {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      // Add any methods not already in providers
      methods.forEach((method) => {
        if (!providers.includes(method)) {
          providers.push(method);
        }
      });
    } catch (error) {
      console.warn("Failed to fetch sign-in methods:", error);
    }
  }

  return {
    email: email || undefined,
    providers,
  };
}

/**
 * Check if user has email/password linked
 */
export function hasEmailPasswordLinked(user?: User | null): boolean {
  const currentUser = user || auth.currentUser;
  if (!currentUser) return false;

  return currentUser.providerData.some(
    (provider) => provider.providerId === "password"
  );
}

/**
 * Check if user has phone authentication
 */
export function hasPhoneLinked(user?: User | null): boolean {
  const currentUser = user || auth.currentUser;
  if (!currentUser) return false;

  return currentUser.providerData.some(
    (provider) => provider.providerId === "phone"
  );
}