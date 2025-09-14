"use client";

import React, { useState } from "react";
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
import { signInSchema } from "../../../lib/auth/validation";
import { Container } from "@mui/material";
import GoogleProfileCompletionModal from "../../components/shared/GoogleProfileCompletionModal";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const getUserLabel = (u: unknown) => {
    if (!u || typeof u !== "object") return null;
    const obj = u as Record<string, unknown>;
    const email = typeof obj.email === "string" ? obj.email : null;
    const phone = typeof obj.phoneNumber === "string" ? obj.phoneNumber : null;
    return email || phone || null;
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

      // Now check for missing fields and show modal if needed
      const missingName = !user.displayName;
      const missingPhone = !user.phoneNumber;
      // TODO: fetch username from DB if needed
      const missingUsername = true; // Always true for demo; replace with real check
      if (missingName || missingPhone || missingUsername) {
        setGoogleProfile(user);
        setShowGoogleModal(true);
        setLoading(false);
        return;
      }
      router.replace("/?notice=login_success");
    } catch (e) {
      const err = e as { message?: string } | undefined;
      setError(err?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  // Handler for Google profile completion modal
  const handleGoogleProfileComplete = async ({
    studentName,
    username,
    password,
    phone,
  }: {
    studentName?: string;
    username: string;
    password: string;
    phone: string;
  }) => {
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
            return;
          }
          // Force ID token refresh
          await user.getIdToken(true);
          // Reload the page to update auth state, keep user signed in
          setShowGoogleModal(false);
          window.location.reload();
          return;
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
            return;
          }
        }
      }
      setShowGoogleModal(false);
      router.replace("/?notice=login_success");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u || null);
    });
    try {
      const pv = localStorage.getItem("phone_verified");
      if (pv) setPhoneVerified(true);
    } catch {}
    return () => unsub();
  }, [router]);

  const [redirecting, setRedirecting] = React.useState(false);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const current = auth.currentUser;
        if (current) {
          try {
            await current.getIdToken(true);
            if (!mounted) return;
            setRedirecting(true);
            setTimeout(() => {
              router.replace("/?notice=already_logged_in");
            }, 300);
            return;
          } catch {
            try {
              await signOut(auth);
            } catch (e) {
              console.warn("signOut failed cleanup", e);
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
  }, [router]);

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
    } catch (e) {
      console.warn("signOut error", e);
    }
    try {
      localStorage.removeItem("phone_verified");
    } catch {}
    setPhoneVerified(false);
    setFirebaseUser(null);
  };

  const EmailPasswordAuth = () => {
    const [form, setForm] = useState({ identifier: "", password: "" });
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
              } catch (e) {
                console.warn("check-email fallback failed", e);
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
        // Validate inputs unless we're in a staged/confirmation UI step where user explicitly wants to create an account.
        if (!(emailExists === false && stagedNewEmail)) {
          const validation = signInSchema.safeParse({ identifier, password });
          if (!validation.success)
            throw new Error(
              validation.error.issues[0]?.message || "Invalid input"
            );
        }

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
            } catch (e) {
              console.warn("check-email fallback failed", e);
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
          const cred = await createUserWithEmailAndPassword(
            auth,
            identifier,
            password
          );
          try {
            const actionCodeSettings = {
              url: `${
                window.location.origin
              }/auth/action?email=${encodeURIComponent(identifier)}`,
              handleCodeInApp: true,
            } as const;
            await sendEmailVerification(cred.user, actionCodeSettings);
          } catch (ve) {
            console.warn("sendEmailVerification (sign-up) failed", ve);
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
        router.replace("/?notice=login_success");
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
        sx={{ display: "flex", flexDirection: "column", gap: 1 }}
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
          helperText={
            form.identifier && /^\+?\d{10,15}$/.test(form.identifier)
              ? "Phone number detected - use phone OTP option below"
              : ""
          }
        />

        {/* Always show password field for any existing email (any provider, including Google). Only hide for truly new emails. */}
        {(emailProviders === null || emailProviders.length > 0) && (
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

      {/* Full-height gradient background, non-scrollable */}
      <Box
        sx={(theme) => ({
          backgroundImage: theme.gradients.brand(),
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "flex-end",
        })}
      >
        {/* Container positioned at bottom-right */}
        <Container
          maxWidth={false}
          sx={{
            position: "relative",
            right: "8rem",
            width: "460px",
            m: 0,
            p: 0,
          }}
        >
          {/* White card with internal scroll if needed */}
          <Box
            sx={{
              width: "100%",
              bgcolor: "background.paper",
              boxShadow: 6,
              px: 4,
              pt: 4,
              pb: 2,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
              display: "flex",
              flexDirection: "column",
              // Ensure there is vertical room so the bottom text sits at the card bottom
              minHeight: { xs: 0, sm: 480 },
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", mb: 6 }}>
              <Typography variant="caption">WELCOME BACK</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
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

            <Stack spacing={2} sx={{ mb: 2 }}>
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
                  py: 1,
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
                  mt: 1,
                  minHeight: 56, // reserve ~ one alert height
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
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
            {/* Sign up link at the bottom of the card */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: "auto", // push to bottom remaining space
                pt: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Don&apos;t have an account?{" "}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => router.push("/auth/register")}
                  sx={{
                    p: 0,
                    minWidth: "auto",
                    ml: 0.5,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "neramPurple.main",
                  }}
                >
                  Create One
                </Button>
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
      <GoogleProfileCompletionModal
        open={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onComplete={handleGoogleProfileComplete}
        initialPhone={googleProfile?.phoneNumber ?? undefined}
      />
    </>
  );
}
