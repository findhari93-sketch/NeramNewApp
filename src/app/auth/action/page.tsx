"use client";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import { applyActionCode, signInWithCustomToken } from "firebase/auth";
import { auth } from "../../../lib/firebase";

export default function AuthActionPage() {
  const router = useRouter();
  const [status, setStatus] = React.useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = React.useState<string>("Verifying your email…");
  const [pastedLink, setPastedLink] = React.useState<string>("");
  const [verifyingManual, setVerifyingManual] = React.useState<boolean>(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let mode = params.get("mode");
    let oobCode = params.get("oobCode");
    const continueEmail = params.get("email");
    // Sometimes Firebase sends a 'continueUrl' or 'link' param wrapping the real verification link
    const continueUrlRaw = params.get("continueUrl") || params.get("link");
    if ((!mode || !oobCode) && continueUrlRaw) {
      try {
        const inner = new URL(continueUrlRaw);
        const innerParams = inner.searchParams;
        mode = mode || innerParams.get("mode");
        oobCode =
          oobCode || innerParams.get("oobCode") || innerParams.get("oobcode");
      } catch (e) {
        console.warn("Failed to parse continueUrl/link wrapper", e);
      }
    }

    // Some clients may place params in the hash; try to recover them
    if ((!mode || !oobCode) && typeof window !== "undefined") {
      try {
        const hash = window.location.hash || ""; // e.g. #mode=verifyEmail&oobCode=...
        if (hash.startsWith("#")) {
          const hp = new URLSearchParams(hash.slice(1));
          mode = mode || hp.get("mode");
          oobCode = oobCode || hp.get("oobCode") || hp.get("oobcode");
        }
      } catch {}
    }

    if (mode === "verifyEmail" && oobCode) {
      (async () => {
        try {
          await applyActionCode(auth, oobCode);
          // Try to auto-sign-in the user if they are already authenticated
          // in this browser (Firebase may have a session). If not, attempt
          // to refresh any existing local token stored by the app.
          try {
            let u = auth.currentUser;
            if (!u) {
              // Some flows keep an id token in localStorage under 'firebase_id_token'.
              // Try a conservative, optional silent restore: if a token exists,
              // verify it by calling a backend endpoint that accepts an id token.
              const maybeToken =
                typeof window !== "undefined"
                  ? localStorage.getItem("firebase_id_token")
                  : null;
              if (maybeToken) {
                // We can't directly set the client auth state from a raw token, but
                // we can call a lightweight /api/auth/restore-session which will
                // (optionally) validate token server-side and set a session cookie
                // or return user info. We'll attempt a restore and then call
                // auth.currentUser.getIdToken() after a brief delay.
                try {
                  const res = await fetch("/api/auth/restore-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idToken: maybeToken }),
                  });
                  const j = await res.json().catch(() => ({}));
                  if (j && j.customToken) {
                    try {
                      await signInWithCustomToken(auth, j.customToken);
                      // client is now signed in
                      u = auth.currentUser;
                    } catch (siErr) {
                      console.warn("signInWithCustomToken failed", siErr);
                    }
                  } else {
                    // give firebase a moment to reflect any session/cookie change
                    await new Promise((r) => setTimeout(r, 300));
                    u = auth.currentUser;
                  }
                } catch (e) {
                  // ignore restore failures; this is best-effort
                  console.warn("session restore attempt failed", e);
                }
              }
            }
            // If we have a user now, upsert to DB and refresh token
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
                console.warn("upsert after verify (auto-signin) failed", e);
              }
            }
          } catch (e) {
            console.warn("auto sign-in logic failed", e);
          }

          // Fire a lightweight analytics event for verification completion
          try {
            await fetch("/api/analytics/event", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                event: "email_verified",
                email: continueEmail || null,
                timestamp: new Date().toISOString(),
              }),
            });
          } catch (e) {
            // analytics failure should not block UX
            console.warn("analytics event failed", e);
          }
          // CRITICAL: Ensure user exists in Supabase after verification
          // If the user happens to be signed in already, seed/update DB now
          try {
            const u = auth.currentUser;
            if (u) {
              const idToken = await u.getIdToken(true); // Force refresh token
              const upsertRes = await fetch("/api/users/upsert", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                  uid: u.uid,
                  email: u.email,
                  displayName: u.displayName,
                  phone: u.phoneNumber,
                }),
              });
              if (!upsertRes.ok) {
                console.error("upsert after verify failed with status:", upsertRes.status);
                const errorText = await upsertRes.text().catch(() => "");
                console.error("upsert error details:", errorText);
              } else {
                console.log("✓ User successfully upserted to database after verification");
              }
            }
          } catch (e) {
            console.error("upsert after verify failed", e);
          }
          // Redirect immediately to login page without showing intermediate success page
          const u = auth.currentUser;
          const emailForQP = continueEmail || u?.email || "";
          const qp = emailForQP
            ? `?notice=verify_email_success&email=${encodeURIComponent(
                emailForQP
              )}${u ? "&auto_signin=1" : ""}`
            : `?notice=verify_email_success${u ? "&auto_signin=1" : ""}`;
          router.replace(`/auth/login${qp}`);
        } catch (e) {
          console.warn("applyActionCode failed", e);
          setStatus("error");
          setMessage("Verification link is invalid or expired.");
        }
      })();
    } else {
      // If there's no oobCode but we received an `email` param, this is
      // likely the post-verification redirect from Firebase's hosted action
      // page: Firebase already applied the action and then redirects to our
      // continueUrl without the oobCode. Redirect immediately to login.
      if (continueEmail) {
        const qp = `?notice=verify_email_success&email=${encodeURIComponent(
          continueEmail
        )}`;
        router.replace(`/auth/login${qp}`);
        return;
      }

      setStatus("error");
      setMessage("Invalid action link.");
    }
  }, [router]);

  const handleManualVerify = async () => {
    setVerifyingManual(true);
    try {
      let url: URL | null = null;
      try {
        url = new URL(pastedLink.trim());
      } catch {}
      if (!url) {
        setStatus("error");
        setMessage("Please paste the full verification link from the email.");
        setVerifyingManual(false);
        return;
      }
      const code = url.searchParams.get("oobCode");
      const mode = url.searchParams.get("mode");
      if (mode !== "verifyEmail" || !code) {
        setStatus("error");
        setMessage("The link you pasted is invalid or incomplete.");
        setVerifyingManual(false);
        return;
      }
      await applyActionCode(auth, code);
      try {
        const u = auth.currentUser;
        if (u) {
          const idToken = await u.getIdToken();
          await fetch("/api/users/upsert", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({}),
          });
        }
      } catch (e) {
        console.warn("upsert after manual verify failed", e);
      }
      setStatus("success");
      setMessage("Your email has been verified. You can now sign in.");
    } catch {
      setStatus("error");
      setMessage("Verification failed. Please request a new link.");
    } finally {
      setVerifyingManual(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 560, mx: "auto", p: 2, textAlign: "center" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Email verification
      </Typography>
      {status === "loading" && <CircularProgress />}
      {status !== "loading" && (
        <Alert
          severity={status === "success" ? "success" : "error"}
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      )}
      {status === "error" && (
        <Box sx={{ textAlign: "left", mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            If clicking the email link didn’t work, paste the full link from
            your email below and we’ll verify here:
          </Typography>
          <textarea
            value={pastedLink}
            onChange={(e) => setPastedLink(e.target.value)}
            placeholder="Paste the verification link (starts with https://)"
            style={{
              width: "100%",
              minHeight: 100,
              padding: 8,
              fontFamily: "inherit",
            }}
          />
          <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleManualVerify}
              disabled={verifyingManual}
            >
              {verifyingManual ? (
                <CircularProgress size={18} />
              ) : (
                "Verify from link"
              )}
            </Button>
            <Button
              variant="text"
              onClick={() => router.replace("/auth/login")}
            >
              Go to login
            </Button>
          </Box>
        </Box>
      )}
      {status !== "error" && (
        <Button
          variant="contained"
          onClick={() => router.replace("/auth/login")}
        >
          Go to login
        </Button>
      )}
    </Box>
  );
}
