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
import TopNavBar from "../../components/shared/TopNavBar";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "../../../lib/firebase";
import { friendlyFirebaseError } from "../../../lib/firebaseErrorMessages";
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
import { signInSchema, passwordSchema } from "../../../lib/auth/validation";
import { Container } from "@mui/material";
import GoogleProfileCompletionModal from "../../components/shared/GoogleProfileCompletionModal";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextTarget = searchParams?.get("next");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [emailFromQuery, setEmailFromQuery] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<unknown | null>(null);
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

  const getUserLabel = (u: unknown) => {
    if (!u || typeof u !== "object") return null;
    const obj = u as Record<string, unknown>;
    const email = typeof obj.email === "string" ? obj.email : null;
    const phone = typeof obj.phoneNumber === "string" ? obj.phoneNumber : null;
    return email || phone || null;
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
      const res = await signInWithPopup(auth, provider);
      const user = res.user;
      // Immediately upsert Google user data to Supabase
      const idToken = await user.getIdToken();
      try {
        localStorage.setItem("firebase_id_token", idToken);
      } catch {}
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

  React.useEffect(() => {
    // If a user is already signed in, redirect them to profile — they should
    // never be able to view the login page while authenticated.
    const current = auth.currentUser;
    if (current) {
      try {
        // If a specific redirect target is provided (e.g. next=/calculator),
        // do not override it here. Let the targeted redirect flow handle it.
        if (!nextTarget) {
          router.replace("/profile");
        }
      } catch {}
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u || null);
      if (u) {
        // enforce redirect for any signed-in user who navigates to this page
        try {
          // Respect next=... param when present and avoid forcing /profile
          if (!nextTarget) {
            router.replace("/profile");
          }
        } catch {}
      }
    });
    try {
      const pv = localStorage.getItem("phone_verified");
      if (pv) setPhoneVerified(true);
    } catch {}
    return () => unsub();
  }, [router, showGoogleModal, emailFlowPendingProfile, nextTarget]);

  // If a verified Firebase user signs in (for example after verification),
  // ensure their Supabase profile has required fields before allowing
  // automatic navigation into the app. If missing fields are detected,
  // show the profile completion modal and prevent redirect.
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = auth.currentUser;
        if (u && u.emailVerified) {
          // ask server for profile status
          try {
            const idToken = await u.getIdToken();
            const res = await fetch("/api/session", {
              headers: { Authorization: `Bearer ${idToken}` },
            });
            if (!mounted) return;
            const j = await res.json().catch(() => ({} as any));
            // Only proceed if the response was OK and a user row exists
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
              setGoogleProfile(u as any);
              setShowGoogleModal(true);
            }
          } catch (e) {
            console.warn("profile completion check failed", e);
          }
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      mounted = false;
    };
  }, [firebaseUser]);

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
            setFirebaseUser(null);
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
    if (email) setEmailFromQuery(email);
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
    } else if (n === "login_success") {
      setNotice("Signed in successfully.");
    } else if (n === "already_logged_in") {
      setNotice("You are already signed in.");
    } else if (n === "login_required") {
      setNotice("Please log in to continue.");
    } else {
      setNotice(null);
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
      const u = auth.currentUser;
      if (!u) {
        setResendResult(
          "To resend, enter your email and password above and click Sign In — we'll resend automatically."
        );
        return;
      }
      if (u.emailVerified) {
        setResendResult("Your email is already verified.");
        return;
      }
      const targetEmail = u.email || emailFromQuery || undefined;
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/action?email=${encodeURIComponent(
          targetEmail || ""
        )}`,
        handleCodeInApp: true,
      } as const;
      await sendEmailVerification(u, actionCodeSettings);
      setResendResult(
        `Verification link sent${
          targetEmail ? ` to ${targetEmail}` : ""
        }. Please check your inbox and spam folder.`
      );
    } catch {
      setResendResult("Failed to resend verification. Please try again later.");
    } finally {
      setResendLoading(false);
      setResendAttempts((a) => a + 1);
      if (resendAttempts + 1 < MAX_RESEND_ATTEMPTS) setCooldown(20);
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch {
      console.warn("signOut error");
    }
    try {
      localStorage.removeItem("phone_verified");
    } catch {}
    setPhoneVerified(false);
    setFirebaseUser(null);
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
          try {
            let methods = await fetchSignInMethodsForEmail(auth, value);
            console.log("[DEBUG] fetchSignInMethodsForEmail", value, methods);
            // If Firebase returned empty, fallback to server-side Supabase lookup
            if (Array.isArray(methods) && methods.length === 0) {
              try {
                const res = await fetch(
                  `/api/auth/check-email?email=${encodeURIComponent(value)}`
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
          let methods = isEmail
            ? await fetchSignInMethodsForEmail(auth, identifier)
            : [];
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
          const cred = await createUserWithEmailAndPassword(
            auth,
            identifier,
            password
          );
          // Send branded verification email via custom endpoint
          try {
            await fetch("/api/auth/send-verification-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: identifier }),
            });
          } catch (ve) {
            console.warn("send-verification-email (sign-up) failed", ve);
            // Fallback to Firebase's default if custom email fails
            try {
              const actionCodeSettings = {
                url: `${
                  window.location.origin
                }/auth/action?email=${encodeURIComponent(identifier)}`,
                handleCodeInApp: true,
              } as const;
              await sendEmailVerification(cred.user, actionCodeSettings);
            } catch (fallbackErr) {
              console.warn(
                "Fallback sendEmailVerification also failed",
                fallbackErr
              );
            }
          }
          // Upsert user to Supabase now while we still have a valid user session.
          try {
            const idToken = await cred.user.getIdToken();
            try {
              localStorage.setItem("firebase_id_token", idToken);
            } catch {}
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
          try {
            await signOut(auth);
          } catch {}
          router.replace(
            `/auth/login?notice=verify_email_sent&email=${encodeURIComponent(
              identifier
            )}`
          );
          return;
        }

        // For existing users: attempt sign-in
        await signInWithEmailOrUsername(identifier, password);
        const u = auth.currentUser;
        if (u && !u.emailVerified) {
          // Check if Google is a provider for this email before sending verification
          const methods = await fetchSignInMethodsForEmail(
            auth,
            u.email || identifier
          );
          if (methods.includes("google.com")) {
            setEmailPasswordError(
              "This email is registered with Google. Please use 'Sign in with Google' or set a password from your profile."
            );
            await signOut(auth);
            setEmailPasswordLoading(false);
            return;
          }
          try {
            const actionCodeSettings = {
              url: `${
                window.location.origin
              }/auth/action?email=${encodeURIComponent(u.email || identifier)}`,
              handleCodeInApp: true,
            } as const;
            await sendEmailVerification(u, actionCodeSettings);
          } catch (ve) {
            console.warn("sendEmailVerification (unverified login) failed", ve);
          }
          try {
            await signOut(auth);
          } catch {}
          router.replace(
            `/auth/login?notice=verify_email_required&email=${encodeURIComponent(
              u?.email || identifier
            )}`
          );
          return;
        }
        if (u) {
          try {
            const idToken = await u.getIdToken();
            try {
              localStorage.setItem("firebase_id_token", idToken);
            } catch {}
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
          await redirectAfterLogin(idToken);
        }
      } catch (err) {
        const code = (err as { code?: string } | undefined)?.code || "";
        // If login fails for a Google-linked email, show a helpful message
        if (
          isEmail &&
          (code === "auth/wrong-password" || code === "auth/user-not-found")
        ) {
          const methods = await fetchSignInMethodsForEmail(auth, identifier);
          if (methods.includes("google.com")) {
            setEmailPasswordError(
              "This email is registered with Google. Please use 'Sign in with Google' or set a password from your profile."
            );
            setEmailPasswordLoading(false);
            return;
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
      ? ""
      : checkingEmail
      ? "Checking account..."
      : emailExists === false && stagedNewEmail
      ? "Sign Up"
      : emailExists === false && !stagedNewEmail
      ? "Create Account"
      : "Sign In";

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
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
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
                    fontSize: { xs: "0.875rem", sm: "0.875rem" },
                    height: { xs: "40px", sm: "40px" },
                  },
                }}
              />
            )}
            {emailExists !== false && (
              <Button
                variant="text"
                size="small"
                onClick={() => router.push("/account")}
                sx={{ alignSelf: "flex-end" }}
              >
                Forgot password?
              </Button>
            )}
          </>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={emailPasswordLoading || checkingEmail}
          fullWidth
          sx={{
            py: { xs: 1.5, sm: 1 },
            fontSize: { xs: "1rem", sm: "0.875rem" },
          }}
        >
          {emailPasswordLoading ? <CircularProgress size={20} /> : buttonLabel}
        </Button>
        {emailPasswordError && (
          <Alert severity="error">{emailPasswordError}</Alert>
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
          // Prefer dynamic viewport height on mobile with fallback on larger screens
          minHeight: { xs: "100dvh", sm: "100vh" },
          display: "flex",
          flexDirection: "column",
          justifyContent: { xs: "flex-start", sm: "flex-end" },
          alignItems: { xs: "center", sm: "flex-end" },
          p: { xs: 1, sm: 0 },
          pt: { xs: 8, sm: 0 }, // Add top padding on mobile for status bar
          overflow: "hidden", // Prevent scroll on main container
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
            flex: { xs: "1 1 auto", sm: "none" }, // Allow flex growth on mobile
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
                mb: { xs: 2.5, sm: 6 },
                flexShrink: 0, // Prevent header from shrinking
              }}
            >
              <Typography variant="caption">WELCOME BACK</Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "0.875rem", sm: "0.75rem" },
                }}
              >
                Log In to your Account
              </Typography>
            </Box>

            {/* Show current auth state + logout */}
            {redirecting ? (
              <Box sx={{ mb: 2 }}>
                <Typography>Redirecting...</Typography>
              </Box>
            ) : (
              (firebaseUser || phoneVerified) && (
                <Box
                  sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}
                >
                  <Typography>
                    Signed in as {getUserLabel(firebaseUser) || "phone user"}
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

            <Stack
              spacing={{ xs: 1.2, sm: 2 }}
              sx={{ mb: { xs: 1, sm: 2 }, flex: "1 1 auto" }}
            >
              {notice && <Alert severity="success">{notice}</Alert>}
              {error && <Alert severity="error">{error}</Alert>}

              {/* Resend verification helper */}
              {notice && notice.toLowerCase().includes("verify") && (
                <Alert severity="info">
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography variant="body2">
                      Tip: Check your spam/junk folder before resending.
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      {resendAttempts >= MAX_RESEND_ATTEMPTS ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Typography variant="body2" color="error">
                            You have reached the maximum resend attempts.
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={resetResendSession}
                          >
                            Try Again
                          </Button>
                        </Box>
                      ) : cooldown > 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          You can resend in {cooldown}s…
                        </Typography>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleResendVerification}
                          disabled={resendLoading}
                        >
                          {resendLoading ? (
                            <CircularProgress size={16} />
                          ) : (
                            "Resend verification email"
                          )}
                        </Button>
                      )}
                      {resendResult && (
                        <Typography variant="body2">{resendResult}</Typography>
                      )}
                      {resendAttempts > 0 &&
                        resendAttempts < MAX_RESEND_ATTEMPTS && (
                          <Typography variant="caption" color="text.secondary">
                            Attempt {resendAttempts} of {MAX_RESEND_ATTEMPTS}
                          </Typography>
                        )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      If you&apos;re signed out, re-enter your email and
                      password above and click Sign In — we&apos;ll resend
                      automatically if your email isn&apos;t verified.
                    </Typography>
                  </Box>
                </Alert>
              )}

              {/* Email/Password first */}
              <EmailPasswordAuth />

              <Divider>OR</Divider>

              {/* Google next */}
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
                  py: { xs: 1.5, sm: 1 },
                  fontSize: { xs: "1rem", sm: "0.875rem" },
                  "&:hover": {
                    bgcolor: "#fff",
                    borderColor: "#dadce0",
                    boxShadow: 1,
                  },
                  "&:disabled": {
                    bgcolor: "#fff",
                    color: "text.disabled",
                    borderColor: "#e0e0e0",
                  },
                }}
              >
                Continue with Google
              </Button>
              {/* Reserved inline message area below social buttons to avoid card height jump */}
              <Box
                sx={{
                  mt: { xs: 0.5, sm: 1 },
                  minHeight: { xs: 24, sm: 56 }, // Further reduced for mobile
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  flexShrink: 0, // Prevent shrinking
                }}
              >
                {/* Show resend status or general notice moved from above if desired */}
                {!notice && resendResult && (
                  <Typography variant="caption" color="text.secondary">
                    {resendResult}
                  </Typography>
                )}
              </Box>
            </Stack>
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
  // Wrap the client page in Suspense so hooks like useSearchParams bailouts are supported
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
