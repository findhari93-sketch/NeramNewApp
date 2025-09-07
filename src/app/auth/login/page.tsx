"use client";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import PhoneAuth from "../../components/shared/PhoneAuth";
import TopNavBar from "../../components/shared/TopNavBar";
import { useRouter } from "next/navigation";
import { auth } from "../../../lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Avoid reading auth.currentUser or localStorage during initial render
  // to prevent SSR/client hydration mismatches. Populate these on mount.
  const [firebaseUser, setFirebaseUser] = useState<unknown | null>(null);
  const [phoneAuthKey, setPhoneAuthKey] = useState<number>(0);
  const [phoneVerified, setPhoneVerified] = useState<boolean>(false);

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
      await signInWithPopup(auth, provider);
      // on success, navigate to home with success notice
      router.replace("/?notice=login_success");
    } catch (e) {
      const err = e as { message?: string } | undefined;
      setError(err?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const linkedInSignIn = () => {
    // LinkedIn requires a server-side client secret exchange; here we redirect to
    // the LinkedIn authorization endpoint — configure env vars:
    // NEXT_PUBLIC_LINKEDIN_CLIENT_ID and NEXT_PUBLIC_LINKEDIN_REDIRECT_URI
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    // For security, redirect to our server-side callback which will perform the token exchange
    const redirectUri = `${window.location.origin}/api/auth/linkedin/callback`;
    if (!clientId || !redirectUri) {
      setError(
        "LinkedIn login is not configured. Set NEXT_PUBLIC_LINKEDIN_CLIENT_ID and NEXT_PUBLIC_LINKEDIN_REDIRECT_URI."
      );
      return;
    }
    const scope = encodeURIComponent("r_liteprofile r_emailaddress");
    const state = encodeURIComponent("neram_auth");
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}&state=${state}`;
    // perform redirect
    if (typeof window !== "undefined") window.location.href = url;
  };

  // Track firebase auth state so we can show a logout button
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u || null);
    });
    // read phone_verified from localStorage after mount
    try {
      const pv = localStorage.getItem("phone_verified");
      if (pv) setPhoneVerified(true);
    } catch {}
    // initialize phoneAuthKey so PhoneAuth mounts consistently on client
    setPhoneAuthKey(Date.now());
    return () => unsub();
  }, [router]);

  // Auto-redirect if already logged in (client-side check)
  // Only redirect when the Firebase token is valid. If token verification fails
  // (for example the user was removed from Firebase by an admin), sign out and
  // clear local flags so the user stays on the login page.
  const [redirecting, setRedirecting] = React.useState(false);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const current = auth.currentUser;
        // If there's a firebase user, force-refresh token to verify it's still valid.
        if (current) {
          try {
            await current.getIdToken(true);
            if (!mounted) return;
            setRedirecting(true);
            // give a small delay to show the redirecting message
            setTimeout(() => {
              router.replace("/?notice=already_logged_in");
            }, 300);
            return;
          } catch {
            // token refresh failed -> likely the account was deleted or token revoked
            try {
              await signOut(auth);
            } catch (e) {
              console.warn("signOut failed during invalid-token cleanup", e);
            }
            try {
              localStorage.removeItem("phone_verified");
            } catch {}
            setFirebaseUser(null);
            return;
          }
        }

        // No firebase user: do not auto-redirect. Clear stale phone_verified flag
        // so the UI prompts for login/phone again instead of sending the user
        // straight to the app.
        try {
          localStorage.removeItem("phone_verified");
        } catch {}
      } catch {
        // ignore errors and avoid redirecting
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  // Handle LinkedIn callback (server redirects here with linkedin=success)
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("linkedin") === "success") {
        setRedirecting(true);
        router.replace("/?notice=login_success");
      }
    } catch {}
  }, [router]);

  const handleLogout = async () => {
    setError(null);
    try {
      // Firebase sign out (covers Google)
      await signOut(auth);
    } catch (e) {
      // ignore sign-out errors but record them
      console.warn("signOut error", e);
    }

    // Clear phone verification and LinkedIn tokens (if any)
    try {
      localStorage.removeItem("phone_verified");
      localStorage.removeItem("linkedin_token");
    } catch {}

    // Remount PhoneAuth to force it to show the phone input again
    setPhoneAuthKey(Date.now());
    setPhoneVerified(false);
    setFirebaseUser(null);
  };

  return (
    <>
      <TopNavBar />
      <Box sx={{ maxWidth: 760, mx: "auto", p: 2 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Sign in or create an account
        </Typography>

        {/* Show current auth state + logout */}
        {redirecting ? (
          <Box sx={{ mb: 2 }}>
            <Typography>Redirecting...</Typography>
          </Box>
        ) : (
          (firebaseUser || phoneVerified) && (
            <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
              <Typography>
                Signed in as {getUserLabel(firebaseUser) || "phone user"}
              </Typography>
              <Button variant="outlined" color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          )
        )}

        <Stack spacing={2} sx={{ mb: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Button
            variant="contained"
            onClick={googleSignIn}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : null}
          >
            Continue with Google
          </Button>

          <Button variant="outlined" onClick={linkedInSignIn}>
            Continue with LinkedIn
          </Button>

          <Divider>OR</Divider>

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Sign up / Log in with phone
            </Typography>
            <PhoneAuth
              key={phoneAuthKey}
              onVerified={() => {
                // After phone verification, redirect to home with notice
                try {
                  setPhoneVerified(true);
                } catch {}
                router.replace("/profile");
              }}
            />
          </Box>
        </Stack>
      </Box>
    </>
  );
}
