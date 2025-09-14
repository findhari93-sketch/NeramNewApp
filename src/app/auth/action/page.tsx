"use client";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import { applyActionCode } from "firebase/auth";
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
          // If the user happens to be signed in already, seed/update DB now
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
            console.warn("upsert after verify failed", e);
          }
          // If a session exists, redirect to home; otherwise, send to login with a success notice
          const u = auth.currentUser;
          if (u) {
            setStatus("success");
            setMessage("Email verified. Redirecting…");
            setTimeout(() => {
              router.replace("/?notice=login_success");
            }, 300);
          } else {
            setStatus("success");
            setMessage(
              `Your email${
                continueEmail ? ` (${continueEmail})` : ""
              } has been verified. You can now sign in.`
            );
            setTimeout(() => {
              const qp = continueEmail
                ? `?notice=verify_email_success&email=${encodeURIComponent(
                    continueEmail
                  )}`
                : `?notice=verify_email_success`;
              router.replace(`/auth/login${qp}`);
            }, 600);
          }
        } catch (e) {
          console.warn("applyActionCode failed", e);
          setStatus("error");
          setMessage("Verification link is invalid or expired.");
        }
      })();
    } else {
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
