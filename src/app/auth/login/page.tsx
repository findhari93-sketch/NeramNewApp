"use client";

import React, { Suspense, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import LinearProgress from "@mui/material/LinearProgress";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TopNavBar from "../../components/shared/TopNavBar";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "../../../lib/firebase";
import { friendlyFirebaseError } from "../../../lib/firebaseErrorMessages";
import {
  getWebPageSchema,
  getBreadcrumbSchema,
  renderJsonLd,
} from "@/lib/schema";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  User,
} from "firebase/auth";
import { signInWithEmailOrUsername } from "../../../lib/auth/firebaseAuth";
import { validateEmailForAuth } from "../../../lib/validation/email";
import { signInSchema, passwordSchema } from "../../../lib/auth/validation";
import { Container } from "@mui/material";
import GoogleProfileCompletionModal from "../../components/shared/GoogleProfileCompletionModal";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextTarget = searchParams?.get("next");
  // Consolidated auth state - single source of truth
  const [authState, setAuthState] = useState<{
    user: User | null;
    loading: boolean;
    initialized: boolean;
  }>({
    user: null,
    loading: true,
    initialized: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [emailFromQuery, setEmailFromQuery] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendResult, setResendResult] = useState<string | null>(null);
  const [resendAttempts, setResendAttempts] = useState(0);
  const MAX_RESEND_ATTEMPTS = 3;
  const [cooldown, setCooldown] = useState(0);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleProfile, setGoogleProfile] = useState<User | null>(null);
  const [emailFlowPendingProfile, setEmailFlowPendingProfile] =
    useState<boolean>(false);
  const [forceModalNonClosable, setForceModalNonClosable] =
    useState<boolean>(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isAttemptingLogin, setIsAttemptingLogin] = useState(false);
  const [signupStatus, setSignupStatus] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  const emailParam = React.useMemo(
    () => searchParams?.get("email") || emailFromQuery,
    [searchParams, emailFromQuery]
  );
  const isVerificationNotice = React.useMemo(
    () =>
      Boolean(
        notice &&
          notice.toLowerCase().includes("verify") &&
          typeof emailParam === "string" &&
          emailParam.trim().length > 0
      ),
    [notice, emailParam]
  );

  const getUserLabel = (u: unknown) => {
    if (!u || typeof u !== "object") return null;
    const obj = u as Record<string, unknown>;
    const email = typeof obj.email === "string" ? obj.email : null;
    const phone = typeof obj.phoneNumber === "string" ? obj.phoneNumber : null;
    return email || phone || null;
  };

  // Helper to check if user has email/Google auth (not just phone)
  const hasEmailOrGoogleAuth = (u: unknown) => {
    if (!u || typeof u !== "object") return false;
    const obj = u as Record<string, unknown>;
    const providerData = Array.isArray(obj.providerData)
      ? obj.providerData
      : [];
    // Check if user has email or google.com provider (not just phone)
    return providerData.some((provider: any) => {
      const providerId = provider?.providerId;
      return providerId === "password" || providerId === "google.com";
    });
  };

  // Helper to check profile completeness and redirect accordingly
  const redirectAfterLogin = async (idToken: string) => {
    try {
      // Always respect explicit next=... if present (e.g., from calculator)
      if (nextTarget) {
        router.replace(`${nextTarget}`);
        return;
      }
      // Fetch user profile (from /api/users/me or /api/session)
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json().catch(() => ({}));
      const userRow = data?.user || data;
      // Assume profile completeness is a number 0-100 on userRow.profile_completeness or similar
      // If not present, fallback to 0
      let completeness = 0;
      if (userRow && typeof userRow.profile_completeness === "number") {
        completeness = userRow.profile_completeness;
      } else if (
        userRow &&
        userRow.profile &&
        typeof userRow.profile.completeness === "number"
      ) {
        completeness = userRow.profile.completeness;
      }
      if (completeness < 70) {
        router.replace("/profile?notice=complete_profile");
      } else {
        router.replace("/?notice=login_success");
      }
    } catch {
      // fallback: respect next first, else go to profile
      if (nextTarget) router.replace(`${nextTarget}`);
      else router.replace("/profile?notice=complete_profile");
    }
  };

  const googleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Set persistence based on Remember Me preference
      try {
        const {
          setPersistence,
          browserLocalPersistence,
          browserSessionPersistence,
        } = await import("firebase/auth");
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence
        );
      } catch (persistErr) {
        console.warn("googleSignIn persistence failed", persistErr);
      }
      const res = await signInWithPopup(auth, provider);
      const user = res.user;
      // Immediately upsert Google user data to Supabase
      const idToken = await user.getIdToken();
      // Store token in secure httpOnly cookie instead of localStorage
      try {
        await fetch("/api/auth/set-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      } catch (err) {
        console.warn("Failed to set session cookie:", err);
      }
      await fetch("/api/users/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          phone: user.phoneNumber,
          profile: { photoURL: user.photoURL },
          provider: "google.com",
        }),
      });
      // Check for missing fields from the DB to avoid false positives
      try {
        const sessionRes = await fetch("/api/session", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const j = await sessionRes.json().catch(() => ({} as any));
        const userRow = (j?.user ?? j) || null;
        if (sessionRes.ok && userRow) {
          const studentName =
            (userRow.student_name as string | undefined) ??
            (userRow.profile?.student_name as string | undefined) ??
            null;
          const phoneVal =
            (userRow.phone as string | undefined) ??
            (userRow.profile?.phone as string | undefined) ??
            null;
          const usernameVal =
            (userRow.username as string | undefined) ??
            (userRow.profile?.username as string | undefined) ??
            null;
          const missingName = !studentName || studentName.trim() === "";
          const missingPhone = !phoneVal || phoneVal.trim() === "";
          const missingUsername = !usernameVal || usernameVal.trim() === "";
          if (missingName || missingPhone || missingUsername) {
            setGoogleProfile(user);
            // If phone is missing, force the modal to be non-closable so we
            // require phone verification before proceeding.
            if (missingPhone) setForceModalNonClosable(true);
            setShowGoogleModal(true);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("googleSignIn profile check failed", e);
      }
      await redirectAfterLogin(idToken);
    } catch (e) {
      setError(friendlyFirebaseError(e));
    } finally {
      setLoading(false);
    }
  };

  // Handler used when modal only collects phone (Google sign-in flow)
  const handlePhoneOnlyComplete = async (phone: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");
      const idToken = await user.getIdToken();
      await fetch("/api/users/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ phone }),
      });
      setShowGoogleModal(false);
      // Notify app that phone verification completed so other components can show a toast
      try {
        window.dispatchEvent(
          new CustomEvent("neram:phoneVerified", {
            detail: {
              message:
                "🎉 Phone Verification Successful! Check your WhatsApp — we’ve sent you the Q&A set of the 2024 NATA / JEE2 Exam along with bonus study materials!",
            },
          })
        );
      } catch {}
      // delay redirect so toast is visible briefly
      setTimeout(async () => {
        try {
          const fresh = await user.getIdToken();
          await redirectAfterLogin(fresh);
        } catch {
          // ignore
        }
      }, 2800);
      // refresh token/state and redirect
      return true;
    } catch (e) {
      setError(friendlyFirebaseError(e));
      return false;
    } finally {
      setLoading(false);
      setForceModalNonClosable(false);
    }
  };

  React.useEffect(() => {
    // Trigger fade-in animation on mount
    setMounted(true);

    const handler = (ev: Event) => {
      try {
        const ce = ev as CustomEvent<any>;
        setSnackMessage(ce?.detail?.message || "Phone verified");
        setSnackOpen(true);
        // auto-hide after 3s
        setTimeout(() => setSnackOpen(false), 3000);
      } catch {}
    };
    window.addEventListener("neram:phoneVerified", handler as EventListener);
    return () =>
      window.removeEventListener(
        "neram:phoneVerified",
        handler as EventListener
      );
  }, []);

  // Handler for Google profile completion modal
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleGoogleProfileComplete = async ({
    studentName,
    username,
    password,
    phone,
  }: {
    studentName?: string;
    username: string;
    password?: string;
    phone: string;
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");
      const idToken = await user.getIdToken();
      // Save studentName and username to DB (studentName may be undefined)
      await fetch("/api/users/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ student_name: studentName, username, phone }),
      });
      // Link password to Firebase Auth (enables email/password login)
      if (password && user.email) {
        try {
          // Use helper for robust error handling
          const { linkEmailPasswordToCurrentUser } = await import(
            "../../../lib/auth/firebaseAuth"
          );
          await linkEmailPasswordToCurrentUser(user.email, password);
          // Mark email as verified in Firebase Auth (admin API)
          const res = await fetch("/api/auth/mark-email-verified", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid: user.uid }),
          });
          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            console.error(
              "Failed to mark email verified:",
              errJson.error || res.statusText
            );
            setError(
              "Failed to mark email as verified. Please contact support."
            );
            setLoading(false);
            return false;
          }
          // Force ID token refresh
          await user.getIdToken(true);
          // Reload the page to update auth state, keep user signed in
          setShowGoogleModal(false);
          window.location.reload();
          return true;
        } catch (err) {
          // If already linked, ignore; else show error
          if (
            err &&
            typeof err === "object" &&
            (err as any).code === "auth/credential-already-in-use"
          ) {
            // Already linked, continue
          } else {
            setError(err instanceof Error ? err.message : String(err));
            setLoading(false);
            return false;
          }
        }
      }
      setShowGoogleModal(false);
      if (user) {
        const idToken = await user.getIdToken();
        await redirectAfterLogin(idToken);
      }
      return true;
    } catch {
      setError("Failed to complete profile");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handler when email-verified user completes the modal.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEmailProfileComplete = async ({
    studentName,
    username,
    phone,
  }: {
    studentName?: string;
    username: string;
    phone: string;
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");
      const idToken = await user.getIdToken();
      await fetch("/api/users/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ student_name: studentName, username, phone }),
      });
      setShowGoogleModal(false);
      setEmailFlowPendingProfile(false);
      // refresh token/state
      try {
        await user.getIdToken(true);
      } catch {}
      if (user) {
        const idToken = await user.getIdToken();
        await redirectAfterLogin(idToken);
      }
      return true;
    } catch {
      setError("Failed to save profile");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Consolidated auth state management - prevents race conditions
  React.useEffect(() => {
    let mounted = true;

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;

      // User signed out
      if (!user) {
        setAuthState({ user: null, loading: false, initialized: true });
        try {
          localStorage.removeItem("phone_verified");
        } catch {}
        return;
      }

      // User signed in - check if we should redirect
      if (user.emailVerified && !isSigningUp && !isAttemptingLogin) {
        try {
          const idToken = await user.getIdToken();

          // Store session cookie
          try {
            await fetch("/api/auth/set-session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken }),
            });
          } catch (err) {
            console.warn("Failed to set session cookie:", err);
          }

          // Only redirect if not in modal flow
          if (!showGoogleModal && !emailFlowPendingProfile) {
            if (mounted) {
              setAuthState({ user, loading: false, initialized: true });
              if (!nextTarget) {
                router.replace("/profile");
              }
            }
            return;
          }
        } catch (err) {
          console.warn("Auth state update failed:", err);
        }
      }

      if (mounted) {
        setAuthState({ user, loading: false, initialized: true });
      }
    });

    try {
      const pv = localStorage.getItem("phone_verified");
      if (pv) setPhoneVerified(true);
    } catch {}

    return () => {
      mounted = false;
      unsub();
    };
  }, [
    router,
    showGoogleModal,
    emailFlowPendingProfile,
    nextTarget,
    isSigningUp,
    isAttemptingLogin,
  ]);

  // Profile completeness check - only runs when auth state changes
  React.useEffect(() => {
    let mounted = true;

    (async () => {
      const u = authState.user;
      if (!u || !u.emailVerified || !authState.initialized) return;

      try {
        const idToken = await u.getIdToken();
        const res = await fetch("/api/session", {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (!mounted) return;

        const j = await res.json().catch(() => ({} as any));
        if (!res.ok) return;

        const userRow = (j?.user ?? j) || null;
        if (!userRow) return;

        const studentName =
          (userRow.student_name as string | undefined) ??
          (userRow.profile?.student_name as string | undefined) ??
          null;
        const phoneVal =
          (userRow.phone as string | undefined) ??
          (userRow.profile?.phone as string | undefined) ??
          null;
        const usernameVal =
          (userRow.username as string | undefined) ??
          (userRow.profile?.username as string | undefined) ??
          null;

        const missingName = !studentName || studentName.trim() === "";
        const missingPhone = !phoneVal || phoneVal.trim() === "";
        const missingUsername = !usernameVal || usernameVal.trim() === "";

        if (missingName || missingPhone || missingUsername) {
          setGoogleProfile(u);
          setShowGoogleModal(true);
        }
      } catch (e) {
        console.warn("profile completion check failed", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authState.user, authState.initialized]);

  // Removed duplicate profile-check effect: the redirect flow will now run
  // profile checks just-before-redirect to ensure modal can block navigation.

  const [redirecting, setRedirecting] = React.useState(false);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const current = auth.currentUser;
        if (current) {
          // CRITICAL: Only redirect if email is verified
          // This prevents email signup users from seeing profile before verification
          if (!current.emailVerified) {
            // User is logged in but email not verified - do nothing
            // They'll be signed out by the signup flow
            return;
          }

          try {
            await current.getIdToken(true);
            if (!mounted) return;
            // Before auto-redirecting, ensure the user's Supabase profile has
            // required fields. If not, show the modal and block navigation.
            try {
              if (showGoogleModal || emailFlowPendingProfile) {
                return;
              }
              const u = auth.currentUser;
              if (u && u.emailVerified) {
                const idToken = await u.getIdToken();
                const res = await fetch("/api/users/upsert", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                  },
                  body: JSON.stringify({}),
                });
                const j = await res.json().catch(() => ({} as any));
                const userRow = (j && j.user ? j.user : null) || null;
                if (res.ok && userRow) {
                  const studentName =
                    (userRow.student_name as string | undefined) ??
                    (userRow.profile?.student_name as string | undefined) ??
                    null;
                  const phoneVal =
                    (userRow.phone as string | undefined) ??
                    (userRow.profile?.phone as string | undefined) ??
                    null;
                  const usernameVal =
                    (userRow.username as string | undefined) ??
                    (userRow.profile?.username as string | undefined) ??
                    null;
                  const missingName = !studentName || studentName.trim() === "";
                  const missingPhone = !phoneVal || phoneVal.trim() === "";
                  const missingUsername =
                    !usernameVal || usernameVal.trim() === "";
                  if (missingName || missingUsername || missingPhone) {
                    setGoogleProfile(u as User);
                    setShowGoogleModal(true);
                    setEmailFlowPendingProfile(true);
                    return;
                  }
                }
                // If response not ok or no userRow, fall through to normal redirect
                if (!res.ok) {
                  setGoogleProfile(u as User);
                  setShowGoogleModal(true);
                  setEmailFlowPendingProfile(true);
                  return;
                }
              }
            } catch (e) {
              console.warn("pre-redirect profile check failed", e);
              // fall back to redirecting normally
            }
            setRedirecting(true);
            setTimeout(() => {
              if (nextTarget) router.replace(`${nextTarget}`);
              else router.replace("/?notice=already_logged_in");
            }, 300);
            return;
          } catch {
            try {
              await signOut(auth);
            } catch {
              console.warn("signOut failed cleanup");
            }
            try {
              localStorage.removeItem("phone_verified");
            } catch {}
            setAuthState({ user: null, loading: false, initialized: true });
            return;
          }
        }
        try {
          localStorage.removeItem("phone_verified");
        } catch {}
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [router, showGoogleModal, emailFlowPendingProfile, nextTarget]);

  React.useEffect(() => {
    const n = searchParams?.get("notice");
    const email = searchParams?.get("email");
    const next = searchParams?.get("next");

    // Always set email from query if present (even if already set)
    if (email) {
      setEmailFromQuery(email);
    }

    // Clear signup status when notice is shown
    if (n) {
      setSignupStatus(null);
      setIsSigningUp(false);
    }

    if (n === "verify_email_sent") {
      setNotice(
        `We sent a verification link to ${
          email || "your email"
        }. Please check your inbox (and spam) to complete sign up.`
      );
    } else if (n === "verify_email_required") {
      setNotice(
        `You must verify your email${
          email ? ` (${email})` : ""
        } before signing in. We just sent you a new link.`
      );
    } else if (n === "verify_email_success") {
      setNotice(
        `✅ Your email has been verified successfully! You can now sign in with your account.`
      );
    } else if (n === "login_success") {
      setNotice("Signed in successfully.");
    } else if (n === "already_logged_in") {
      setNotice("You are already signed in.");
    } else if (n === "login_required") {
      // Only show "login required" notice if user was actually redirected from a protected page
      // (indicated by the presence of the 'next' parameter)
      if (next) {
        setNotice("Please log in to continue.");
      } else {
        setNotice(null);
      }
    } else {
      setNotice(null);
      // Clear email from query when no notice
      if (!n) setEmailFromQuery(null);
    }
    const isVerify = n === "verify_email_sent" || n === "verify_email_required";
    if (isVerify && resendAttempts === 0) setCooldown(20);
  }, [router, searchParams, resendAttempts]);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const resetResendSession = () => {
    setResendAttempts(0);
    setCooldown(20);
    setResendResult(null);
  };

  const handleResendVerification = async () => {
    if (cooldown > 0 || resendAttempts >= MAX_RESEND_ATTEMPTS) return;
    setResendLoading(true);
    setResendResult(null);
    try {
      // Use email from URL query parameter (set when user was redirected here)
      const targetEmail = emailParam;

      if (!targetEmail) {
        setResendResult("Please refresh the page and try again.");
        return;
      }

      // Send verification email via our branded email endpoint
      try {
        const emailResponse = await fetch("/api/auth/send-verification-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: targetEmail }),
        });

        const emailResult = await emailResponse.json();

        if (!emailResponse.ok) {
          throw new Error(emailResult.error || "Failed to send email");
        }

        setResendResult(
          `Verification email sent to ${targetEmail}. Please check your inbox and spam folder.`
        );
      } catch (apiError) {
        console.warn(
          "Branded email failed, trying Firebase fallback",
          apiError
        );

        // Fallback: Try to get user and send via Firebase
        const u = auth.currentUser;
        if (!u) {
          throw new Error("Please sign in again to resend verification email.");
        }

        const actionCodeSettings = {
          url: `${
            window.location.origin
          }/auth/action?email=${encodeURIComponent(targetEmail)}`,
          handleCodeInApp: true,
        } as const;
        await sendEmailVerification(u, actionCodeSettings);

        setResendResult(
          `Verification email sent to ${targetEmail}. Please check your inbox and spam folder.`
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to resend verification email.";
      setResendResult(errorMessage);
    } finally {
      setResendLoading(false);
      setResendAttempts((a) => a + 1);
      if (resendAttempts + 1 < MAX_RESEND_ATTEMPTS) setCooldown(20);
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      // Clear server-side session cookie
      await fetch("/api/auth/set-session", { method: "DELETE" });
      await signOut(auth);
    } catch (err) {
      console.warn("signOut error:", err);
    }
    try {
      localStorage.removeItem("phone_verified");
    } catch {}
    setPhoneVerified(false);
    setAuthState({ user: null, loading: false, initialized: true });
  };

  const EmailPasswordAuth = () => {
    const [form, setForm] = useState({
      identifier: "",
      password: "",
      confirmPassword: "",
    });
    const [emailPasswordLoading, setEmailPasswordLoading] = useState(false);
    const [emailPasswordError, setEmailPasswordError] = useState<string | null>(
      null
    );
    const [showPassword, setShowPassword] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [emailExists, setEmailExists] = useState<boolean | null>(null);
    const [stagedNewEmail, setStagedNewEmail] = useState(false);
    const [emailProviders, setEmailProviders] = useState<string[] | null>(null);

    React.useEffect(() => {
      const value = form.identifier.trim();
      // Only validate as an email when it matches a basic email regex.
      // NOTE: removed any `.com` restriction so domains like .net / .org / country TLDs are supported.
      if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
        let cancelled = false;
        (async () => {
          setCheckingEmail(true);
          setEmailPasswordError(null); // Clear previous errors

          // Validate email first (syntax + typo check)
          const emailValidation = validateEmailForAuth(value);
          if (!emailValidation.success) {
            if (!cancelled) {
              setEmailPasswordError(emailValidation.error);
              setCheckingEmail(false);
              setEmailExists(null);
              setEmailProviders(null);
            }
            return;
          }

          try {
            const validatedEmail = emailValidation.data.email;
            let methods = await fetchSignInMethodsForEmail(
              auth,
              validatedEmail
            );
            console.log("[DEBUG] fetchSignInMethodsForEmail", value, methods);
            // If Firebase returned empty, fallback to server-side Supabase lookup
            if (Array.isArray(methods) && methods.length === 0) {
              try {
                const res = await fetch(
                  `/api/auth/check-email?email=${encodeURIComponent(
                    validatedEmail
                  )}`
                );
                if (res.ok) {
                  const j = await res.json();
                  if (
                    j &&
                    Array.isArray(j.providers) &&
                    j.providers.length > 0
                  ) {
                    console.log(
                      "[DEBUG] check-email fallback providers",
                      j.providers
                    );
                    methods = j.providers;
                  }
                }
              } catch {
                console.warn("check-email fallback failed");
              }
            }
            if (cancelled) return;
            setEmailProviders(methods);
            if (methods.length === 0) {
              setEmailExists(false);
              setStagedNewEmail(true);
            } else {
              // any non-empty methods array -> email exists (regardless of provider)
              setEmailExists(true);
              setStagedNewEmail(false);
            }
          } catch (err) {
            console.error(
              "[DEBUG] fetchSignInMethodsForEmail error",
              value,
              err
            );
            if (!cancelled) {
              setEmailExists(null);
              setStagedNewEmail(false);
              setEmailProviders(null);
            }
          } finally {
            if (!cancelled) setCheckingEmail(false);
          }
        })();
        return () => {
          cancelled = true;
        };
      } else {
        setEmailExists(null);
        setStagedNewEmail(false);
        setEmailProviders(null);
      }
    }, [form.identifier]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setEmailPasswordLoading(true);
      setEmailPasswordError(null);
      const identifier = form.identifier.trim();
      const password = form.password;
      const isEmail = identifier.includes("@");
      try {
        // Set persistence based on Remember Me preference
        try {
          const {
            setPersistence,
            browserLocalPersistence,
            browserSessionPersistence,
          } = await import("firebase/auth");
          await setPersistence(
            auth,
            rememberMe ? browserLocalPersistence : browserSessionPersistence
          );
        } catch (persistErr) {
          console.warn("handleSubmit persistence failed", persistErr);
        }
        // Always validate inputs (require password for sign-up path). This ensures
        // a password is provided for new accounts and prevents auth/missing-password.
        const validation = signInSchema.safeParse({ identifier, password });
        if (!validation.success)
          throw new Error(
            validation.error.issues[0]?.message || "Invalid input"
          );

        // If email appears to be new (no providers), proceed with signup flow.
        if (emailExists === false) {
          // Double-check server-side what providers exist in case the effect was stale.
          let methods: string[] = [];
          if (isEmail) {
            try {
              methods = await fetchSignInMethodsForEmail(auth, identifier);
            } catch (methodsErr) {
              console.warn(
                "fetchSignInMethodsForEmail failed during signup check, will try fallback",
                methodsErr
              );
            }
          }
          if (Array.isArray(methods) && methods.length === 0 && isEmail) {
            try {
              const res = await fetch(
                `/api/auth/check-email?email=${encodeURIComponent(identifier)}`
              );
              if (res.ok) {
                const j = await res.json();
                if (j && Array.isArray(j.providers) && j.providers.length > 0)
                  methods = j.providers;
              }
            } catch {
              console.warn("check-email fallback failed");
            }
          }
          // If any providers exist (for example google.com), block email/password sign-up and show helpful message.
          if (methods.length > 0) {
            if (methods.includes("google.com")) {
              setEmailPasswordError(
                "This email is already associated with a Google account. Please use 'Continue with Google' or set a password from your profile."
              );
              setEmailPasswordLoading(false);
              return;
            } else {
              // some other provider exists — block or instruct accordingly
              setEmailPasswordError(
                `This email is already registered (providers: ${methods.join(
                  ", "
                )}). Please sign in using the provider or contact support.`
              );
              setEmailPasswordLoading(false);
              return;
            }
          }

          // create new email/password user
          // Email is already validated during "Checking account..." phase,
          // but validate again as a safety check
          const emailValidation = validateEmailForAuth(identifier);
          if (!emailValidation.success) {
            // This shouldn't happen if the user went through the normal flow
            setEmailPasswordError(emailValidation.error);
            setEmailPasswordLoading(false);
            return;
          }

          // Use the validated (normalized) email
          const validatedEmail = emailValidation.data.email;

          // Validate password strength and confirm password when creating account
          const pwValidation = passwordSchema.safeParse(password);
          if (!pwValidation.success) {
            setEmailPasswordError(
              pwValidation.error.issues[0]?.message ||
                "Password validation failed"
            );
            setEmailPasswordLoading(false);
            return;
          }
          if (stagedNewEmail && password !== form.confirmPassword) {
            setEmailPasswordError("Passwords do not match.");
            setEmailPasswordLoading(false);
            return;
          }
          // Set flag to prevent redirect during signup flow
          setIsSigningUp(true);
          setSignupStatus("Creating your account...");

          let cred;
          let emailSendSuccess = false;

          try {
            // Step 1: Create user account with validated email
            cred = await createUserWithEmailAndPassword(
              auth,
              validatedEmail,
              password
            );

            setSignupStatus("Sending verification email...");

            // Step 2: Immediately try to send verification email
            try {
              const emailResponse = await fetch(
                "/api/auth/send-verification-email",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: validatedEmail }),
                }
              );

              const emailResult = await emailResponse.json();

              if (!emailResponse.ok) {
                throw new Error(
                  emailResult.error || "Failed to send verification email"
                );
              }

              emailSendSuccess = true;
            } catch (ve) {
              console.warn("send-verification-email (sign-up) failed", ve);
              // Fallback to Firebase's default if custom email fails
              try {
                const actionCodeSettings = {
                  url: `${
                    window.location.origin
                  }/auth/action?email=${encodeURIComponent(validatedEmail)}`,
                  handleCodeInApp: true,
                } as const;
                await sendEmailVerification(cred.user, actionCodeSettings);
                emailSendSuccess = true;
              } catch (fallbackErr) {
                console.error(
                  "Both verification email methods failed",
                  fallbackErr
                );
                // Delete the user if email sending failed
                try {
                  await cred.user.delete();
                } catch (deleteErr) {
                  console.error(
                    "Failed to delete user after email send failure",
                    deleteErr
                  );
                }
                throw new Error(
                  "Unable to send verification email. Please check your email address and try again."
                );
              }
            }

            // Step 3: Only upsert to DB if email was sent successfully
            if (emailSendSuccess) {
              try {
                const idToken = await cred.user.getIdToken();
                // Store token in secure httpOnly cookie instead of localStorage
                try {
                  await fetch("/api/auth/set-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idToken }),
                  });
                } catch (err) {
                  console.warn("Failed to set session cookie:", err);
                }
                await fetch("/api/users/upsert", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                  },
                  body: JSON.stringify({}),
                });
              } catch (upsertErr) {
                console.warn("upsert after sign-up failed", upsertErr);
              }
            }

            // Step 4: Sign out and redirect with success message
            try {
              await signOut(auth);
            } catch {}

            // Clear all signup states before redirect
            setIsSigningUp(false);
            setSignupStatus(null);
            setEmailPasswordLoading(false);

            router.replace(
              `/auth/login?notice=verify_email_sent&email=${encodeURIComponent(
                validatedEmail
              )}`
            );
            return;
          } catch (signupError: any) {
            setIsSigningUp(false);
            setSignupStatus(null);
            setEmailPasswordLoading(false);

            // Handle specific Firebase errors
            if (signupError.code === "auth/email-already-in-use") {
              setEmailPasswordError(
                "This email is already registered. Please sign in instead."
              );
            } else if (signupError.code === "auth/invalid-email") {
              setEmailPasswordError("Please enter a valid email address.");
            } else if (signupError.message) {
              setEmailPasswordError(signupError.message);
            } else {
              setEmailPasswordError(
                "Failed to create account. Please try again."
              );
            }
            return;
          }
        }

        // For existing users: attempt sign-in
        setIsAttemptingLogin(true);
        await signInWithEmailOrUsername(identifier, password);
        const u = auth.currentUser;
        if (u && !u.emailVerified) {
          // Check if Google is a provider for this email before sending verification
          let methods: string[] = [];
          try {
            methods = await fetchSignInMethodsForEmail(
              auth,
              u.email || identifier
            );
          } catch (methodsErr) {
            console.warn(
              "fetchSignInMethodsForEmail failed, continuing anyway",
              methodsErr
            );
          }
          if (methods.includes("google.com")) {
            setEmailPasswordError(
              "This email is registered with Google. Please use 'Sign in with Google' or set a password from your profile."
            );
            await signOut(auth);
            setIsAttemptingLogin(false);
            setEmailPasswordLoading(false);
            return;
          }

          // User needs to verify email - send verification and redirect to notice
          const userEmail = u.email || identifier;

          try {
            // Try custom branded email first
            await fetch("/api/auth/send-verification-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: userEmail }),
            });
          } catch (ve) {
            console.warn(
              "send-verification-email (unverified login) failed",
              ve
            );
            // Fallback to Firebase default
            try {
              const actionCodeSettings = {
                url: `${
                  window.location.origin
                }/auth/action?email=${encodeURIComponent(userEmail)}`,
                handleCodeInApp: true,
              } as const;
              await sendEmailVerification(u, actionCodeSettings);
            } catch (fallbackErr) {
              console.warn(
                "Fallback sendEmailVerification also failed",
                fallbackErr
              );
            }
          }

          try {
            await signOut(auth);
          } catch {}

          setIsAttemptingLogin(false);
          setEmailPasswordLoading(false);

          // Redirect to verification notice page with resend option
          router.replace(
            `/auth/login?notice=verify_email_required&email=${encodeURIComponent(
              userEmail
            )}`
          );
          return;
        }
        if (u) {
          try {
            const idToken = await u.getIdToken();
            // Store token in secure httpOnly cookie instead of localStorage
            try {
              await fetch("/api/auth/set-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
              });
            } catch (err) {
              console.warn("Failed to set session cookie:", err);
            }
            await fetch("/api/users/upsert", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({}),
            });
          } catch (e) {
            console.warn("upsert after email/password login failed", e);
          }
        }
        if (u) {
          const idToken = await u.getIdToken();
          // Reset the login flag before redirecting to allow normal auth state changes
          setIsAttemptingLogin(false);
          await redirectAfterLogin(idToken);
        }
      } catch (err) {
        // Reset signup and login flags on error
        setIsSigningUp(false);
        setIsAttemptingLogin(false);
        const code = (err as { code?: string } | undefined)?.code || "";
        // If login fails for a Google-linked email, show a helpful message
        if (
          isEmail &&
          (code === "auth/wrong-password" || code === "auth/user-not-found")
        ) {
          try {
            const methods = await fetchSignInMethodsForEmail(auth, identifier);
            if (methods.includes("google.com")) {
              setEmailPasswordError(
                "This email is registered with Google. Please use 'Sign in with Google' or set a password from your profile."
              );
              setEmailPasswordLoading(false);
              return;
            }
          } catch (methodsErr) {
            console.warn(
              "fetchSignInMethodsForEmail failed in error handler",
              methodsErr
            );
          }
        }
        if (
          code === "auth/wrong-password" ||
          code === "auth/invalid-credential"
        )
          setEmailPasswordError("Incorrect email or password.");
        else if (err instanceof Error) setEmailPasswordError(err.message);
        else setEmailPasswordError(String(err));
      } finally {
        setEmailPasswordLoading(false);
      }
    };

    const buttonLabel = emailPasswordLoading
      ? isSigningUp
        ? "Creating account..."
        : "Signing in..."
      : checkingEmail
      ? "Checking account..."
      : emailExists === false && stagedNewEmail
      ? "Sign Up"
      : emailExists === false && !stagedNewEmail
      ? "Create Account"
      : "Sign In";

    // Password strength helper
    const computePasswordStrength = (pw: string) => {
      let score = 0;
      if (!pw) return { score: 0, label: "", color: "error" };
      const length = pw.length;
      if (length >= 8) score += 25;
      else if (length >= 6) score += 15;
      else score += 5;
      if (/[A-Z]/.test(pw)) score += 15;
      if (/[a-z]/.test(pw)) score += 15;
      if (/[0-9]/.test(pw)) score += 15;
      if (/[^A-Za-z0-9]/.test(pw)) score += 15;
      if (length >= 12) score += 15;
      if (score > 100) score = 100;
      let label: string;
      let color: string;
      if (score < 30) {
        label = "Weak";
        color = "error";
      } else if (score < 60) {
        label = "Fair";
        color = "warning";
      } else if (score < 85) {
        label = "Good";
        color = "info";
      } else {
        label = "Strong";
        color = "success";
      }
      return { score, label, color };
    };
    const strength = computePasswordStrength(form.password);

    // Hide email/username + password inputs entirely when already signed in.
    if (authState.user && hasEmailOrGoogleAuth(authState.user)) {
      return null;
    }

    return (
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1.5, sm: 1 },
        }}
      >
        <TextField
          size="small"
          label="Email or Username"
          value={form.identifier}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, identifier: e.target.value }))
          }
          fullWidth
          required
          sx={{
            "& .MuiInputBase-root": {
              fontSize: { xs: "0.9rem", sm: "0.9rem" },
              height: { xs: "50px", sm: "52px" },
              backgroundColor: (theme) => theme.palette.grey[50],
              transition: "box-shadow 0.25s, border-color 0.25s",
            },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
            },
            "& .MuiOutlinedInput-root.Mui-focused": {
              boxShadow: (theme) =>
                `0 0 0 3px rgba(${theme.palette.primary.main.replace(
                  "#",
                  ""
                )},0.25)`,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              transition: "border-color 0.25s",
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: "primary.main",
              },
          }}
          helperText={
            form.identifier && /^\+?\d{10,15}$/.test(form.identifier)
              ? "Phone number detected - use phone OTP option below"
              : ""
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlined fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* Always show password field for any existing email (any provider, including Google). Only hide for truly new emails. */}
        {(stagedNewEmail ||
          emailProviders === null ||
          emailProviders.length > 0) && (
          <>
            <TextField
              size="small"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              fullWidth
              required
              sx={{
                "& .MuiInputBase-root": {
                  fontSize: { xs: "0.9rem", sm: "0.9rem" },
                  height: { xs: "50px", sm: "52px" },
                  backgroundColor: (theme) => theme.palette.grey[50],
                  transition: "box-shadow 0.25s, border-color 0.25s",
                },
                "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
                "& .MuiOutlinedInput-root.Mui-focused": {
                  boxShadow: (theme) =>
                    `0 0 0 3px ${theme.palette.primary.main}40`,
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "primary.main",
                  },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {form.password && (
              <Box sx={{ mt: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 0.5,
                    gap: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Password strength: {strength.label}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {strength.score}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={strength.score}
                  color={strength.color as any}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            )}
            {/* Confirm password only for staged sign-up (new email) */}
            {stagedNewEmail && (
              <TextField
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
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: { xs: "0.9rem", sm: "0.9rem" },
                    height: { xs: "50px", sm: "52px" },
                    backgroundColor: (theme) => theme.palette.grey[50],
                    transition: "box-shadow 0.25s, border-color 0.25s",
                  },
                  "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
                  "& .MuiOutlinedInput-root.Mui-focused": {
                    boxShadow: (theme) =>
                      `0 0 0 3px ${theme.palette.primary.main}40`,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: "primary.main",
                    },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            {emailExists !== false && (
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  const target = form.identifier.trim();
                  const qp = target
                    ? `?email=${encodeURIComponent(target)}`
                    : "";
                  router.push(`/auth/forgot${qp}`);
                }}
                sx={{ alignSelf: "flex-end" }}
              >
                Forgot password?
              </Button>
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label="Remember me"
              sx={{ mt: 0.5, userSelect: "none" }}
            />
          </>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={emailPasswordLoading || checkingEmail}
          fullWidth
          sx={{
            py: { xs: 1.4, sm: 1.1 },
            fontSize: { xs: "1rem", sm: "0.95rem" },
            gap: 1,
            borderRadius: 999,
            backgroundImage: (theme) => theme.gradients.brand(),
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transition: "box-shadow 0.25s, transform 0.25s, filter 0.25s",
            fontWeight: 600,
            letterSpacing: 0.3,
            "&:hover": {
              boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
              filter: "brightness(1.05)",
            },
            "&:active": {
              transform: "translateY(1px)",
              boxShadow: "0 3px 8px rgba(0,0,0,0.20)",
            },
            "&.Mui-disabled": {
              backgroundImage: (theme) => theme.gradients.brand(),
              opacity: 0.55,
              color: "#fff",
            },
          }}
        >
          {emailPasswordLoading && (
            <CircularProgress size={20} color="inherit" />
          )}
          {buttonLabel}
        </Button>
        {signupStatus && (
          <Alert severity="info" icon={<CircularProgress size={20} />}>
            {signupStatus}
          </Alert>
        )}
        {emailPasswordError && (
          <Alert severity="error" onClose={() => setEmailPasswordError(null)}>
            {emailPasswordError}
          </Alert>
        )}
      </Box>
    );
  };

  return (
    <>
      <TopNavBar backgroundMode="transparent" />

      {/* Full-height gradient background, responsive layout */}
      <Box
        sx={(theme) => ({
          backgroundImage: theme.gradients.brand(),
          minHeight: { xs: "100dvh", sm: "100vh" },
          display: "flex",
          flexDirection: "column",
          justifyContent: { xs: "center", sm: "flex-end" },
          alignItems: { xs: "center", sm: "flex-end" },
          p: { xs: 2, sm: 0 },
          pt: { xs: 0, sm: 0 },
          overflow: { xs: "auto", sm: "hidden" },
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        })}
      >
        {/* Container positioned responsively */}
        <Container
          maxWidth={false}
          sx={{
            position: { xs: "static", sm: "relative" },
            right: { xs: 0, sm: "8rem" },
            width: { xs: "100%", sm: "460px" },
            maxWidth: { xs: "100%", sm: "460px" },
            m: 0,
            p: { xs: 0, sm: 0 },
            my: { xs: "auto", sm: 0 },
            display: { xs: "flex", sm: "block" },
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          {/* White card with responsive design */}
          <Box
            sx={{
              width: "100%",
              bgcolor: "background.paper",
              boxShadow: { xs: 3, sm: 6 },
              px: { xs: 2.5, sm: 4 },
              pt: { xs: 2.5, sm: 4 },
              pb: { xs: 2, sm: 2 },
              borderRadius: { xs: 3, sm: 0 },
              borderTopLeftRadius: { xs: 20, sm: 15 },
              borderTopRightRadius: { xs: 20, sm: 15 },
              borderBottomLeftRadius: { xs: 20, sm: 0 },
              borderBottomRightRadius: { xs: 20, sm: 0 },
              display: "flex",
              flexDirection: "column",
              // Responsive height handling
              minHeight: { xs: "auto", sm: 480 },
              maxHeight: { xs: "calc(100vh - 80px)", sm: "none" }, // Better mobile height calculation
              overflowY: { xs: "auto", sm: "visible" },
              flex: { xs: "1 1 auto", sm: "none" }, // Allow flexible sizing on mobile
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                mb: { xs: 2, sm: 4 },
                gap: 0.5,
                flexShrink: 0, // Prevent header from shrinking
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "1.5rem", sm: "1.75rem" },
                  color: "text.primary",
                }}
              >
                Welcome Back 👋
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                }}
              >
                Sign up / Sign in to continue your learning
              </Typography>
            </Box>

            {/* Show current auth state + logout */}
            {redirecting ? (
              <Box sx={{ mb: 2 }}>
                <Typography>Redirecting...</Typography>
              </Box>
            ) : (
              authState.user &&
              hasEmailOrGoogleAuth(authState.user) && (
                <Box
                  sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}
                >
                  <Typography>
                    Signed in as {getUserLabel(authState.user) || "user"}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Box>
              )
            )}

            {/* Conditionally render ONLY verification UI or ONLY sign-in UI, never both */}
            {isVerificationNotice ? (
              // ==================== EMAIL VERIFICATION FLOW ====================
              <Stack spacing={3} sx={{ py: 2 }}>
                {/* Success message with check icon */}
                <Alert
                  severity="success"
                  icon={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 24,
                        height: 24,
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                          fill="currentColor"
                        />
                      </svg>
                    </Box>
                  }
                  sx={{
                    fontSize: "0.95rem",
                    "& .MuiAlert-message": { width: "100%" },
                  }}
                >
                  {notice}
                </Alert>

                {/* Resend email section */}
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 3,
                    backgroundColor: "grey.50",
                  }}
                >
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        gutterBottom
                      >
                        Didn&apos;t receive the email?
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Check your spam folder, or request a new verification
                        email below.
                      </Typography>
                    </Box>

                    {resendResult && (
                      <Alert
                        severity={
                          resendResult.toLowerCase().includes("failed") ||
                          resendResult.toLowerCase().includes("error")
                            ? "error"
                            : "success"
                        }
                        sx={{ fontSize: "0.875rem" }}
                      >
                        {resendResult}
                      </Alert>
                    )}

                    {resendAttempts >= MAX_RESEND_ATTEMPTS ? (
                      <Box>
                        <Alert severity="warning" sx={{ mb: 1.5 }}>
                          Maximum resend attempts reached. Please wait a few
                          minutes before trying again.
                        </Alert>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={resetResendSession}
                          size="large"
                        >
                          Reset and Try Again
                        </Button>
                      </Box>
                    ) : (
                      <Box>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleResendVerification}
                          disabled={resendLoading || cooldown > 0}
                          size="large"
                          startIcon={
                            resendLoading ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : undefined
                          }
                        >
                          {cooldown > 0
                            ? `Resend in ${cooldown}s`
                            : resendLoading
                            ? "Sending..."
                            : "Resend Verification Email"}
                        </Button>
                        {resendAttempts > 0 &&
                          resendAttempts < MAX_RESEND_ATTEMPTS && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                                textAlign: "center",
                                mt: 1,
                              }}
                            >
                              Attempt {resendAttempts} of {MAX_RESEND_ATTEMPTS}
                            </Typography>
                          )}
                      </Box>
                    )}
                  </Stack>
                </Box>

                {/* Back to Sign In button */}
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    setEmailFromQuery(null);
                    setNotice(null);
                    setResendAttempts(0);
                    setResendResult(null);
                    setCooldown(0);
                    router.push("/auth/login");
                  }}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  ← Back to Sign In
                </Button>
              </Stack>
            ) : (
              // ==================== NORMAL SIGN IN / SIGN UP FLOW ====================
              <Stack
                spacing={{ xs: 1.2, sm: 2 }}
                sx={{ mb: { xs: 1, sm: 2 }, flex: "1 1 auto" }}
              >
                {notice && <Alert severity="success">{notice}</Alert>}
                {error && (
                  <Alert
                    severity="error"
                    variant="filled"
                    sx={{
                      animation: "fadeIn .4s",
                      "@keyframes fadeIn": {
                        from: { opacity: 0, transform: "translateY(-4px)" },
                        to: { opacity: 1, transform: "translateY(0)" },
                      },
                      boxShadow: 3,
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <EmailPasswordAuth />

                <Divider>OR</Divider>

                <Button
                  variant="outlined"
                  onClick={googleSignIn}
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={18} />
                    ) : (
                      <Box
                        sx={{ width: 18, height: 18, display: "inline-flex" }}
                        aria-hidden
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                          width="18"
                          height="18"
                        >
                          <path
                            fill="#FFC107"
                            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12  s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.643,6.053,29.082,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20  s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                          />
                          <path
                            fill="#FF3D00"
                            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039  l5.657-5.657C33.643,6.053,29.082,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                          />
                          <path
                            fill="#4CAF50"
                            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36  c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                          />
                          <path
                            fill="#1976D2"
                            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.236-2.231,4.166-3.994,5.571  c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.97,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                          />
                        </svg>
                      </Box>
                    )
                  }
                  fullWidth
                  sx={{
                    textTransform: "none",
                    bgcolor: "#fff",
                    color: "#3c4043",
                    borderColor: "#dadce0",
                    borderRadius: 999,
                    py: { xs: 1.4, sm: 1.1 },
                    fontSize: { xs: "1rem", sm: "0.95rem" },
                    fontWeight: 600,
                    letterSpacing: 0.2,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    transition: "box-shadow 0.25s, transform 0.25s",
                    "&:hover": {
                      bgcolor: "#fff",
                      borderColor: "#dadce0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      transform: "translateY(-1px)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                    },
                    "&:disabled": {
                      bgcolor: "#fff",
                      color: "text.disabled",
                      borderColor: "#e0e0e0",
                      boxShadow: "none",
                    },
                  }}
                >
                  Continue with Google
                </Button>

                {/* Reserved space for messages to prevent layout shift */}
                <Box
                  sx={{
                    mt: { xs: 0.5, sm: 1 },
                    minHeight: { xs: 24, sm: 56 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {!notice && resendResult && (
                    <Typography variant="caption" color="text.secondary">
                      {resendResult}
                    </Typography>
                  )}
                </Box>
              </Stack>
            )}
          </Box>
        </Container>
      </Box>
      <GoogleProfileCompletionModal
        open={showGoogleModal}
        onClose={() => {
          setShowGoogleModal(false);
          setForceModalNonClosable(false);
        }}
        onComplete={handlePhoneOnlyComplete}
        initialPhone={googleProfile?.phoneNumber ?? undefined}
        forceComplete={forceModalNonClosable}
      />
      <Snackbar
        open={snackOpen}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setSnackOpen(false)}
      >
        <MuiAlert elevation={6} variant="filled" severity="success">
          {snackMessage}
        </MuiAlert>
      </Snackbar>
    </>
  );
}

export default function LoginPage() {
  const webPageSchema = getWebPageSchema({
    name: "Sign In / Sign Up - Neram Classes",
    description:
      "Sign in to your Neram Classes account or create a new account to access architecture exam preparation courses",
    url: "/auth/login",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Login", url: "/auth/login" },
    ],
  });
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Login", url: "/auth/login" },
  ]);

  // Wrap the client page in Suspense so hooks like useSearchParams bailouts are supported
  return (
    <>
      {/* Schema Markup for Login Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(webPageSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={renderJsonLd(breadcrumbSchema)}
      />
      <Suspense fallback={null}>
        <LoginPageInner />
      </Suspense>
    </>
  );
}
