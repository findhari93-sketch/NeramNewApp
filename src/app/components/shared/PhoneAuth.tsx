// app/apply/components/PhoneAuth.tsx
import { useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { auth } from "../../../lib/firebase";
// client Supabase no longer used for persisting user; we call server upsert instead
import saveUserProfile from "../../../lib/saveUserProfile";
import apiClient from "../../../lib/apiClient";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  linkWithPhoneNumber,
  signInWithRedirect,
  type ConfirmationResult,
  PhoneAuthProvider,
} from "firebase/auth";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";

const PHONE_KEY = "phone_verified";
// reCAPTCHA Enterprise site key — prefer Vite env var VITE_RECAPTCHA_ENTERPRISE_SITE_KEY.
// Keep the original value as a fallback to avoid breaking runtime during migration,
// but you should place the key in a .env file instead:
// VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=6LeVyrsrAAAAAEC_QxBB7aA0B4tDADXcWoRq8EFs
const RECAPTCHA_ENTERPRISE_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY ||
  "6LeVyrsrAAAAAEC_QxBB7aA0B4tDADXcWoRq8EFs";

// Small helper: detect if grecaptcha.enterprise is available
function hasEnterpriseGreCaptcha(): boolean {
  try {
    const win = window as unknown as { grecaptcha?: unknown };
    const g = win.grecaptcha;
    if (!g || typeof g !== "object") return false;
    const enterprise = (g as { enterprise?: unknown }).enterprise;
    return !!(
      enterprise &&
      typeof enterprise === "object" &&
      typeof (enterprise as { execute?: unknown }).execute === "function"
    );
  } catch {
    return false;
  }
}

// Create an ApplicationVerifier-like wrapper that calls grecaptcha.enterprise.execute
function createEnterpriseVerifier(action = "submit") {
  return {
    type: "recaptcha",
    async verify() {
      const g = (window as any).grecaptcha;
      if (!RECAPTCHA_ENTERPRISE_SITE_KEY)
        throw new Error("RECAPTCHA_ENTERPRISE_SITE_KEY is not configured");
      if (!g || !g.enterprise || typeof g.enterprise.execute !== "function")
        throw new Error("grecaptcha.enterprise not available");
      // grecaptcha.enterprise.execute returns a Promise<string> (token)
      const token = await g.enterprise.execute(RECAPTCHA_ENTERPRISE_SITE_KEY, {
        action,
      });
      if (!token) throw new Error("reCAPTCHA enterprise returned no token");
      return token as string;
    },
    // optional clear noop
    clear() {
      /* no-op */
    },
  } as const;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const anyErr = err as { message?: string; code?: string };
    return anyErr.message || anyErr.code || "Something went wrong.";
  }
  return "Something went wrong.";
}

export default function PhoneAuth({
  initialPhone,
  onVerified,
}: {
  initialPhone?: string | null;
  onVerified?: (phone: string) => void;
}) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "done">("phone");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [popupBlocked, setPopupBlocked] = useState(false);

  // Keep a single verifier instance for the component lifetime.
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const renderPromiseRef = useRef<Promise<number | void> | null>(null);

  // If already verified on this device, skip the flow.
  useEffect(() => {
    const verified = localStorage.getItem(PHONE_KEY);
    if (verified) setStep("done");
  }, []);

  // If parent supplied an initial phone (for re-verification), prefill it.
  useEffect(() => {
    if (initialPhone) {
      try {
        setPhone(String(initialPhone));
      } catch {}
    }
  }, [initialPhone]);

  // Ensure the verifier exists and has finished rendering before use.
  const ensureVerifier = async (): Promise<RecaptchaVerifier> => {
    if (!verifierRef.current) {
      verifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
      renderPromiseRef.current = verifierRef.current.render();
    }
    if (renderPromiseRef.current) {
      // Avoid hanging forever if the reCAPTCHA script fails to load.
      const rp = renderPromiseRef.current;
      // Allow more time for the reCAPTCHA script to load on slow networks
      const timeoutMs = 20000;
      try {
        await Promise.race([
          rp,
          new Promise((_res, rej) =>
            setTimeout(
              () => rej(new Error("reCAPTCHA render timeout")),
              timeoutMs
            )
          ),
        ]);
      } catch (err) {
        // If render failed or timed out, reset the verifier so caller can retry or show an error.
        // Provide a clearer message to the user and reset verifier
        try {
          setError(
            "Unable to load reCAPTCHA. Please check your network or reload the page and try again."
          );
        } catch {}
        resetVerifier();
        // Never rethrow a non-Error value to avoid `Runtime Error: null/undefined` in Next.js dev overlay
        throw err instanceof Error
          ? err
          : new Error(String(err ?? "unknown error"));
      }
    }
    return verifierRef.current!;
  };

  // If the verifier gets into a bad state, clear and recreate it.
  const resetVerifier = () => {
    try {
      verifierRef.current?.clear?.();
    } catch {
      // no-op
    }
    verifierRef.current = null;
    renderPromiseRef.current = null;
  };

  const normalizeE164 = (v: string) =>
    v.startsWith("+") ? v.replace(/[^\d+]/g, "") : `+${v.replace(/\D/g, "")}`;

  const sendOtp = async () => {
    setError("");
    setLoading(true);
    setPopupBlocked(false);
    try {
      const num = normalizeE164(phone);
      if (!num || num.length < 8)
        throw new Error("Enter a valid phone number.");
      // Prefer reCAPTCHA Enterprise if available. If it fails, fall back to Firebase RecaptchaVerifier.
      if (hasEnterpriseGreCaptcha()) {
        try {
          const enterpriseVerifier = createEnterpriseVerifier("phone_auth");
          const current = auth.currentUser;
          let c;
          if (current) {
            c = await linkWithPhoneNumber(
              current,
              num,
              enterpriseVerifier as any
            );
          } else {
            c = await signInWithPhoneNumber(
              auth,
              num,
              enterpriseVerifier as any
            );
          }
          setConfirmation(c);
          setStep("otp");
          setLoading(false);
          return;
        } catch (err) {
          console.warn("Enterprise reCAPTCHA failed, falling back:", err);
        }
      }

      // Create/await the Firebase RecaptchaVerifier
      const verifier = await ensureVerifier();

      // Try to send; if verifier is in a destroyed state, recreate and retry once.
      try {
        // Detect popup block by catching DOMException or window.open failure
        let popupBlockedDetected = false;
        const origWindowOpen = window.open;
        window.open = function (...args) {
          const win = origWindowOpen.apply(window, args);
          if (!win || win.closed || typeof win.closed === "undefined") {
            popupBlockedDetected = true;
          }
          return win;
        };
        try {
          const current = auth.currentUser;
          let c;
          if (current) {
            c = await linkWithPhoneNumber(current, num, verifier);
          } else {
            c = await signInWithPhoneNumber(auth, num, verifier);
          }
          if (popupBlockedDetected) {
            setPopupBlocked(true);
            setError(
              "Popup blocked. Please allow popups or use the fallback below."
            );
            return;
          }
          setConfirmation(c);
          setStep("otp");
        } finally {
          window.open = origWindowOpen;
        }
      } catch (e) {
        const s = String(e);
        if (s.includes("assertNotDestroyed") || s.includes("_reset")) {
          resetVerifier();
          const v2 = await ensureVerifier();
          const current = auth.currentUser;
          let c;
          if (current) {
            c = await linkWithPhoneNumber(current, num, v2);
          } else {
            c = await signInWithPhoneNumber(auth, num, v2);
          }
          setConfirmation(c);
          setStep("otp");
        } else if (
          s.toLowerCase().includes("popup") ||
          s.toLowerCase().includes("blocked")
        ) {
          setPopupBlocked(true);
          setError(
            "Popup blocked. Please allow popups or use the fallback below."
          );
        } else {
          throw new Error(String(e ?? "unknown error"));
        }
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    setLoading(true);
    try {
      if (!confirmation)
        throw new Error("No confirmation object. Please retry.");
      if (otp.length !== 6) throw new Error("Enter the 6-digit code.");

      await confirmation.confirm(otp);

      const stored = normalizeE164(phone);
      localStorage.setItem(PHONE_KEY, stored);
      // notify parent that verification succeeded
      try {
        onVerified?.(stored);
      } catch {
        // ignore
      }
      setStep("done");

      // Persist user to database via secure server route (uses service role)
      try {
        const current = auth.currentUser;
        if (current) {
          const idToken = await current.getIdToken();
          await fetch("/api/users/upsert", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              uid: current.uid,
              phone: stored,
              email: current.email,
              displayName: current.displayName || undefined,
              profile: { photoURL: current.photoURL },
            }),
          });
        }
        // Also persist the phone into profile for completeness
        await saveUserProfile({ phone: stored });
      } catch (persistErr) {
        console.warn("Server upsert failed:", persistErr);
        // Non-fatal: the user is verified; allow proceeding. The next profile save will retry.
      }
    } catch (e) {
      setError(getErrorMessage(e) || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    // show verified phone with edit action to re-verify a different number
    const storedPhone = localStorage.getItem(PHONE_KEY);
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <div>
          Phone verified!{" "}
          <span style={{ color: "#7c1fa0" }}>{storedPhone}</span>
        </div>
        <IconButton
          aria-label="edit phone"
          size="small"
          onClick={() => {
            // preserve previous value to prefill the input, then clear verified flag
            const prev = localStorage.getItem(PHONE_KEY);
            try {
              localStorage.removeItem(PHONE_KEY);
            } catch {}
            try {
              resetVerifier();
            } catch {}
            setOtp("");
            setConfirmation(null);
            setError("");
            setStep("phone");
            if (prev) {
              try {
                setPhone(prev);
              } catch {}
            }
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <div style={{ maxWidth: 340, margin: "0 auto" }}>
      {step === "phone" && (
        <>
          <label htmlFor="phone">Phone Number</label>
          <PhoneInput
            country="in"
            value={phone}
            onChange={(value: string, data?: { dialCode?: string }) => {
              const digits = String(value || "").replace(/\D/g, "");
              const dial = (data?.dialCode || "").replace(/\D/g, "");
              const full =
                dial && digits.startsWith(dial)
                  ? `+${digits}`
                  : `+${dial}${digits}`;
              setPhone(full);
            }}
            inputProps={{ name: "phone", required: true, autoFocus: true }}
            inputStyle={{ width: "100%", padding: 10, marginBottom: 12 }}
            specialLabel=""
            enableSearch
          />
          <Button
            variant="contained"
            fullWidth
            onClick={sendOtp}
            disabled={loading || !phone}
            sx={{ py: 1.25 }}
          >
            {loading ? "Sending..." : "Send OTP"}
          </Button>

          {/* Fallback for popup blocked */}
          {popupBlocked && (
            <Box sx={{ mt: 2 }}>
              <Typography color="error" sx={{ mb: 1 }}>
                Popup was blocked by your browser. You can try the fallback
                below:
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={async () => {
                  setError("");
                  setLoading(true);
                  try {
                    const num = normalizeE164(phone);
                    if (!num || num.length < 8)
                      throw new Error("Enter a valid phone number.");
                    // Use signInWithRedirect as fallback
                    const provider = new PhoneAuthProvider(auth);
                    await signInWithRedirect(auth, provider);
                  } catch (e) {
                    setError(getErrorMessage(e));
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || !phone}
                sx={{ py: 1.25 }}
              >
                Use Fallback (Redirect)
              </Button>
            </Box>
          )}

          {/* Keep this mounted; Firebase uses it for the invisible widget */}
          <div id="recaptcha-container" style={{ display: "none" }} />
        </>
      )}

      {step === "otp" && (
        <>
          <Typography sx={{ mb: 1 }}>Enter OTP</Typography>
          <Box
            sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 1.5 }}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <TextField
                key={i}
                id={`otp-box-${i}`}
                inputProps={{
                  inputMode: "numeric",
                  maxLength: 1,
                  style: { textAlign: "center" },
                }}
                value={otp[i] || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (!val) return;
                  const next = otp.split("");
                  next[i] = val;
                  const joined = next.join("").slice(0, 6);
                  setOtp(joined);
                  const nextEl = document.getElementById(
                    `otp-box-${i + 1}`
                  ) as HTMLInputElement | null;
                  if (nextEl && val) nextEl.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace") {
                    e.preventDefault();
                    const chars = otp.split("");
                    if (chars[i]) {
                      chars[i] = "";
                      setOtp(chars.join(""));
                      if (i > 0) {
                        (
                          document.getElementById(
                            `otp-box-${i - 1}`
                          ) as HTMLInputElement | null
                        )?.focus();
                      } else {
                        (
                          document.getElementById(
                            `otp-box-${i}`
                          ) as HTMLInputElement | null
                        )?.focus();
                      }
                      return;
                    }
                    if (i > 0) {
                      const prev = i - 1;
                      chars[prev] = "";
                      setOtp(chars.join(""));
                      (
                        document.getElementById(
                          `otp-box-${prev}`
                        ) as HTMLInputElement | null
                      )?.focus();
                    }
                  } else if (e.key === "ArrowLeft" && i > 0) {
                    e.preventDefault();
                    (
                      document.getElementById(
                        `otp-box-${i - 1}`
                      ) as HTMLInputElement | null
                    )?.focus();
                  } else if (e.key === "ArrowRight" && i < 5) {
                    e.preventDefault();
                    (
                      document.getElementById(
                        `otp-box-${i + 1}`
                      ) as HTMLInputElement | null
                    )?.focus();
                  }
                }}
                sx={{ width: 48 }}
              />
            ))}
          </Box>
          <Button
            variant="contained"
            fullWidth
            onClick={verifyOtp}
            disabled={loading || otp.length !== 6}
            sx={{ py: 1.25 }}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </>
      )}

      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
      {/* Retry button shown when an error occurs so users can try again without reloading */}
      {error && (
        <Box sx={{ mt: 1 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={async () => {
              try {
                setError("");
                resetVerifier();
                await sendOtp();
              } catch (e) {
                try {
                  setError(getErrorMessage(e));
                } catch {}
              }
            }}
            disabled={loading || !phone}
            sx={{ py: 1.25 }}
          >
            Retry
          </Button>
        </Box>
      )}
    </div>
  );
}
