"use client";

// app/apply/components/PhoneAuth.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { auth } from "../../../lib/firebase";
import { friendlyFirebaseError } from "../../../lib/firebaseErrorMessages";
// client Supabase no longer used for persisting user; we call server upsert instead
import saveUserProfile from "../../../lib/saveUserProfile";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  linkWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import InputBase from "@mui/material/InputBase";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { isValidPhoneNumber } from "libphonenumber-js";
import type { CountryDialCode } from "../../../lib/countryDialCodes";
import {
  COUNTRY_DIAL_CODES,
  DEFAULT_COUNTRY,
  findCountryByDialCode,
} from "../../../lib/countryDialCodes";

const PHONE_KEY = "phone_verified";
// reCAPTCHA Enterprise site key from environment variable
// Must be configured in .env.local as NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY
const RECAPTCHA_ENTERPRISE_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;

// Timing constants - centralized configuration
const TIMING = {
  RESEND_COOLDOWN_SECONDS: 30,
  OTP_INPUT_FOCUS_DELAY_MS: 0,
  RECAPTCHA_TIMEOUT_MS: 20000,
  THROTTLE_WINDOW_MS: 30000,
  COUNTDOWN_INTERVAL_MS: 1000,
} as const;

// Type definitions for grecaptcha enterprise
interface GreCaptchaEnterprise {
  execute(siteKey: string, options: { action: string }): Promise<string>;
}

interface WindowWithGreCaptcha extends Window {
  grecaptcha?: {
    enterprise?: GreCaptchaEnterprise;
  };
}

// Small helper: detect if grecaptcha.enterprise is available
function hasEnterpriseGreCaptcha(): boolean {
  try {
    const win = window as WindowWithGreCaptcha;
    const g = win.grecaptcha;
    if (!g || typeof g !== "object") return false;
    const enterprise = g.enterprise;
    return !!(
      enterprise &&
      typeof enterprise === "object" &&
      typeof enterprise.execute === "function"
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
      const win = window as WindowWithGreCaptcha;
      const g = win.grecaptcha;
      if (!RECAPTCHA_ENTERPRISE_SITE_KEY)
        throw new Error("RECAPTCHA_ENTERPRISE_SITE_KEY is not configured");
      if (!g || !g.enterprise || typeof g.enterprise.execute !== "function")
        throw new Error("grecaptcha.enterprise not available");
      // grecaptcha.enterprise.execute returns a Promise<string> (token)
      const token = await g.enterprise.execute(RECAPTCHA_ENTERPRISE_SITE_KEY, {
        action,
      });
      if (!token) throw new Error("reCAPTCHA enterprise returned no token");
      return token;
    },
    // optional clear noop
    clear() {
      /* no-op */
    },
    // Firebase internally calls _reset on verifiers, so provide a no-op implementation
    _reset() {
      /* no-op */
    },
  } as any;
}

// Centralized error handler with consistent logging
function handleError(error: unknown, context: string): string {
  console.error(`[PhoneAuth:${context}]`, error);
  console.error(`[PhoneAuth:${context}] Error details:`, {
    message: error instanceof Error ? error.message : String(error),
    code: (error as { code?: string })?.code,
    stack: error instanceof Error ? error.stack : undefined,
  });

  // Future: Add error tracking integration
  // if (window.Sentry) {
  //   Sentry.captureException(error, { tags: { context } });
  // }

  return getActionableError(error);
}

// Get actionable, user-friendly error messages
function getActionableError(err: unknown): string {
  const code = (err as { code?: string })?.code;

  switch (code) {
    case "auth/invalid-phone-number":
      return "Please check your phone number format and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes before trying again.";
    case "auth/quota-exceeded":
      return "SMS limit reached. Please try again tomorrow or contact support.";
    case "auth/invalid-verification-code":
      return "Invalid code. Please check the code and try again.";
    case "auth/code-expired":
      return "This code has expired. Please request a new one.";
    case "auth/phone-number-already-exists":
      return "This phone number is already registered to another account.";
    case "auth/captcha-check-failed":
      return "Security verification failed. Please try again.";
    default:
      // Fall back to friendly Firebase error or generic message
      return friendlyFirebaseError(err);
  }
}

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const anyErr = err as { message?: string; code?: string };
    return anyErr.message || anyErr.code || "Something went wrong.";
  }
  return "Something went wrong.";
}

const MAX_E164_DIGITS = 15;
const MAX_DIAL_DIGITS = 4;
const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const buildE164 = (dial: string, national: string) => {
  const sanitizedDial = digitsOnly(dial);
  const sanitizedNational = digitsOnly(national);
  if (!sanitizedDial || !sanitizedNational) return "";
  const combined = `${sanitizedDial}${sanitizedNational}`.slice(
    0,
    MAX_E164_DIGITS
  );
  return combined ? `+${combined}` : "";
};

const matchCountryByExactDial = (dial: string): CountryDialCode | null => {
  const cleaned = digitsOnly(dial);
  return (
    COUNTRY_DIAL_CODES.find((country) => country.dialCode === cleaned) || null
  );
};

const deriveCountryFromPhone = (value: string) => {
  const digits = digitsOnly(value);
  if (!digits) {
    return {
      country: DEFAULT_COUNTRY,
      dial: DEFAULT_COUNTRY.dialCode,
      national: "",
    };
  }
  const match = findCountryByDialCode(digits) || DEFAULT_COUNTRY;
  const national = digits.startsWith(match.dialCode)
    ? digits.slice(match.dialCode.length)
    : digits;
  return { country: match, dial: match.dialCode, national };
};

const resolveFirebaseError = (err: unknown) => {
  // Use actionable error messages for better UX
  return getActionableError(err);
};

export default function PhoneAuth({
  initialPhone,
  onVerified,
  label = "on",
}: {
  initialPhone?: string | null;
  onVerified?: (phone: string) => void;
  label?: "on" | "off";
}) {
  const [dialCode, setDialCode] = useState(DEFAULT_COUNTRY.dialCode);
  const [nationalNumber, setNationalNumber] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [countryMenuAnchor, setCountryMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "done">("phone");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [popupBlocked, setPopupBlocked] = useState(false);
  const applyPhoneValue = useCallback((value?: string | null) => {
    const derived = deriveCountryFromPhone(value ?? "");
    setDialCode(derived.dial);
    setNationalNumber(derived.national);
  }, []);
  const phone = buildE164(dialCode, nationalNumber);
  const selectedCountry = matchCountryByExactDial(dialCode) || DEFAULT_COUNTRY;
  const maxNationalDigits = Math.max(
    0,
    MAX_E164_DIGITS - digitsOnly(dialCode || DEFAULT_COUNTRY.dialCode).length
  );
  const isCountryMenuOpen = Boolean(countryMenuAnchor);
  const filteredCountries = COUNTRY_DIAL_CODES.filter((country) => {
    const query = countrySearch.trim().toLowerCase();
    if (!query) return true;
    return (
      country.name.toLowerCase().includes(query) ||
      country.dialCode.includes(query) ||
      country.iso2.toLowerCase().includes(query)
    );
  });
  const canSendPhone = Boolean(phone);
  const closeCountryMenu = () => {
    setCountryMenuAnchor(null);
    setCountrySearch("");
  };
  const handleCountrySelect = (country: CountryDialCode) => {
    setDialCode(country.dialCode);
    closeCountryMenu();
    setTimeout(() => phoneInputRef.current?.focus(), 0);
  };

  useEffect(() => {
    setNationalNumber((prev) => prev.slice(0, maxNationalDigits));
  }, [maxNationalDigits]);

  // Refs & helpers for OTP inputs focus management (avoid getElementById)
  const dialInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Throttle/resend cooldown to avoid spamming sendOtp
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const lastSentAtRef = useRef<number | null>(null);

  // Abort controllers for async operations
  const sendOtpControllerRef = useRef<AbortController | null>(null);
  const upsertControllerRef = useRef<AbortController | null>(null);

  // Keep a single verifier instance for the component lifetime.
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const renderPromiseRef = useRef<Promise<number | void> | null>(null);

  // Comprehensive cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Abort all pending async operations
      try {
        sendOtpControllerRef.current?.abort();
        upsertControllerRef.current?.abort();
      } catch {}
      sendOtpControllerRef.current = null;
      upsertControllerRef.current = null;

      // Clear reCAPTCHA verifier
      try {
        verifierRef.current?.clear?.();
      } catch {}
      verifierRef.current = null;
      renderPromiseRef.current = null;
    };
  }, []);

  // If already verified (check Firebase Auth phone number), skip the flow.
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser?.phoneNumber) {
      // User has a verified phone number in Firebase Auth
      setStep("done");
      // Sync localStorage as a UI hint only (not source of truth)
      try {
        localStorage.setItem(PHONE_KEY, currentUser.phoneNumber);
      } catch {}
    }
  }, []);

  // If parent supplied an initial phone (for re-verification), prefill it.
  useEffect(() => {
    if (initialPhone) {
      try {
        applyPhoneValue(initialPhone);
      } catch {}
    }
  }, [initialPhone, applyPhoneValue]);

  // Autofocus first OTP input and announce step changes for screen readers
  useEffect(() => {
    const announcer = document.getElementById("phone-auth-announcer");

    if (step === "otp") {
      setTimeout(() => otpRefs.current[0]?.focus(), TIMING.OTP_INPUT_FOCUS_DELAY_MS);
      // Announce to screen readers
      if (announcer) {
        announcer.textContent =
          "OTP sent successfully. Please enter the 6-digit verification code.";
      }
    } else if (step === "done") {
      if (announcer) {
        announcer.textContent = "Phone number verified successfully!";
      }
    } else if (step === "phone") {
      if (announcer) {
        announcer.textContent = "Enter your phone number to continue.";
      }
    }
  }, [step]);

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
      try {
        await Promise.race([
          rp,
          new Promise((_res, rej) =>
            setTimeout(
              () => rej(new Error("reCAPTCHA render timeout")),
              TIMING.RECAPTCHA_TIMEOUT_MS
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

  // Countdown timer for resendCooldown
  useEffect(() => {
    if (!resendCooldown) return;
    const t = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, TIMING.COUNTDOWN_INTERVAL_MS);
    return () => clearInterval(t);
  }, [resendCooldown]);

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
    // Create abort controller for this operation
    const controller = new AbortController();
    sendOtpControllerRef.current = controller;

    const hadError = Boolean(error);
    setError("");
    if (hadError) {
      try {
        resetVerifier();
      } catch {}
    }
    setLoading(true);
    setPopupBlocked(false);
    try {
      // Throttle repeated sends
      if (
        lastSentAtRef.current &&
        Date.now() - lastSentAtRef.current < TIMING.THROTTLE_WINDOW_MS
      ) {
        setError("Please wait a moment before requesting another code.");
        setLoading(false);
        return;
      }
      if (!phone) {
        console.error("[PhoneAuth] Empty phone number", { dialCode, nationalNumber });
        setError("Enter a valid phone number.");
        setLoading(false);
        return;
      }
      const num = normalizeE164(phone);
      console.info("[PhoneAuth] sendOtp attempt", {
        dialCode,
        nationalNumber,
        phone,
        normalized: num,
        length: num.length,
      });

      // Validate phone number using libphonenumber-js for accurate international validation
      try {
        if (!isValidPhoneNumber(num)) {
          console.error("[PhoneAuth] Invalid phone number format", { num });
          setError("Please enter a valid phone number for your country.");
          setLoading(false);
          return;
        }
      } catch (validationError) {
        console.error("[PhoneAuth] Phone validation error", { num, error: validationError });
        setError("Enter a valid phone number.");
        setLoading(false);
        return;
      }
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
          // Check if aborted before updating state
          if (controller.signal.aborted) return;
          setConfirmation(c);
          setStep("otp");
          // start resend cooldown to avoid spam
          lastSentAtRef.current = Date.now();
          setResendCooldown(TIMING.RESEND_COOLDOWN_SECONDS);
          setLoading(false);
          return;
        } catch (err) {
          // Check if aborted
          if (controller.signal.aborted) return;
          console.warn("Enterprise reCAPTCHA failed, falling back:", err);
        }
      }

      // Create/await the Firebase RecaptchaVerifier
      const verifier = await ensureVerifier();

      // Check if aborted after async operation
      if (controller.signal.aborted) return;

      // Try to send; if verifier is in a destroyed state, recreate and retry once.
      try {
        const current = auth.currentUser;
        let c;
        if (current) {
          c = await linkWithPhoneNumber(current, num, verifier);
        } else {
          c = await signInWithPhoneNumber(auth, num, verifier);
        }
        // Check if aborted before updating state
        if (controller.signal.aborted) return;
        setConfirmation(c);
        setStep("otp");
        lastSentAtRef.current = Date.now();
        setResendCooldown(TIMING.RESEND_COOLDOWN_SECONDS);
      } catch (e) {
        // Check if aborted
        if (controller.signal.aborted) return;
        const s = String(e);
        // If verifier was destroyed, recreate and retry once
        if (s.includes("assertNotDestroyed") || s.includes("_reset")) {
          resetVerifier();
          const v2 = await ensureVerifier();
          // Check if aborted after async operation
          if (controller.signal.aborted) return;
          const current = auth.currentUser;
          let c;
          if (current) {
            c = await linkWithPhoneNumber(current, num, v2);
          } else {
            c = await signInWithPhoneNumber(auth, num, v2);
          }
          // Check if aborted before updating state
          if (controller.signal.aborted) return;
          setConfirmation(c);
          setStep("otp");
        } else if (
          s.toLowerCase().includes("popup") ||
          s.toLowerCase().includes("blocked")
        ) {
          // Popup was blocked — tell the user and show fallback
          setPopupBlocked(true);
          setError(
            "Popup blocked. Please allow popups or use the fallback below."
          );
        } else {
          throw new Error(String(e ?? "unknown error"));
        }
      }
    } catch (e) {
      // Check if aborted
      if (controller.signal.aborted) return;
      // Use centralized error handler for consistent logging
      setError(handleError(e, "sendOtp"));
    } finally {
      // Clean up controller reference if this is still the current operation
      if (sendOtpControllerRef.current === controller) {
        sendOtpControllerRef.current = null;
      }
      // Only update state if not aborted
      if (!controller.signal.aborted) {
        setLoading(false);
      }
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
      // Store a short-term UI hint locally but do not treat this as the
      // authoritative source of truth — server-side DB is the source of truth.
      try {
        localStorage.setItem(PHONE_KEY, stored);
      } catch {}
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
          // use an AbortController so this request can be cancelled if needed
          upsertControllerRef.current = new AbortController();
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
            signal: upsertControllerRef.current.signal,
          });

          // re-fetch server session so server-side guards pick up the new phone
          try {
            await fetch("/api/session", {
              headers: { Authorization: `Bearer ${idToken}` },
            });
          } catch {
            // non-fatal
          }
          upsertControllerRef.current = null;
        }
        // Also persist the phone into profile for completeness (client helper)
        await saveUserProfile({ phone: stored });
      } catch (persistErr) {
        if ((persistErr as any)?.name === "AbortError") {
          // aborted — treat as non-fatal
        } else {
          console.warn("Server upsert failed:", persistErr);
        }
        // Non-fatal: the user is verified; allow proceeding. The next profile save will retry.
      }
    } catch (e) {
      // Use centralized error handler for consistent logging
      const errorMsg = handleError(e, "verifyOtp");
      setError(errorMsg || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    // show verified phone with edit action to re-verify a different number
    // Use Firebase Auth as source of truth, fall back to localStorage only for display
    const verifiedPhone = auth.currentUser?.phoneNumber || localStorage.getItem(PHONE_KEY);
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography>
          Phone verified!{" "}
          <Box component="span" sx={{ color: "primary.main" }}>
            {verifiedPhone}
          </Box>
        </Typography>
        <IconButton
          aria-label="edit phone"
          size="small"
          onClick={() => {
            // preserve previous value to prefill the input
            const prev = auth.currentUser?.phoneNumber || localStorage.getItem(PHONE_KEY);
            // Clear localStorage hint (actual phone number stays in Firebase Auth)
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
                applyPhoneValue(prev);
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
    <Box sx={{ maxWidth: 340, margin: "0 auto", width: "100%" }}>
      {step === "phone" && (
        <>
          {label !== "off" && (
            <Typography component="label" htmlFor="phone">
              Phone Number
            </Typography>
          )}
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start"
            sx={{ mb: 1.5 }}
          >
            <Chip
              component="div"
              variant="outlined"
              onClick={(event) => {
                if ((event.target as HTMLElement)?.tagName === "INPUT") return;
                setCountryMenuAnchor(event.currentTarget);
                setCountrySearch("");
              }}
              sx={{
                height: 56,
                borderRadius: 2,
                borderColor: "rgba(255,255,255,0.4)",
                bgcolor: "rgba(255,255,255,0.06)",
                flexShrink: 0,
                "& .MuiChip-label": {
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1,
                },
              }}
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <span style={{ fontSize: 20 }}>{selectedCountry.flag}</span>
                  <InputBase
                    inputRef={dialInputRef}
                    value={dialCode ? `+${dialCode}` : "+"}
                    onChange={(event) => {
                      const digits = digitsOnly(event.target.value).slice(
                        0,
                        MAX_DIAL_DIGITS
                      );
                      setDialCode(digits);
                    }}
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                    sx={{
                      width: 78,
                      fontWeight: 600,
                      color: "inherit",
                      "& input": {
                        textAlign: "center",
                        fontWeight: 600,
                        color: "inherit",
                      },
                    }}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      "aria-label": "Country code",
                    }}
                  />
                  <IconButton
                    size="small"
                    aria-label="Select country"
                    onClick={(event) => {
                      event.stopPropagation();
                      setCountryMenuAnchor(event.currentTarget);
                      setCountrySearch("");
                    }}
                    sx={{ color: "inherit" }}
                  >
                    <ArrowDropDownIcon fontSize="small" />
                  </IconButton>
                </Stack>
              }
            />
            <TextField
              fullWidth
              inputRef={phoneInputRef}
              placeholder="9876543210"
              value={nationalNumber}
              onChange={(event) => {
                const raw = event.target.value;
                const digits = digitsOnly(raw);
                const trimmedRaw = raw.trim();
                const looksInternational =
                  trimmedRaw.startsWith("+") || trimmedRaw.startsWith("00");
                let normalized = digits.slice(0, maxNationalDigits);
                if (
                  looksInternational &&
                  digits.startsWith(dialCode) &&
                  digits.length > dialCode.length
                ) {
                  normalized = digits
                    .slice(dialCode.length)
                    .slice(0, maxNationalDigits);
                }
                setNationalNumber(normalized);
              }}
              InputProps={{
                inputMode: "tel",
              }}
              inputProps={{
                maxLength: maxNationalDigits,
                "aria-label": "Phone number",
              }}
              helperText={
                phone
                  ? `We'll send an OTP to ${phone}`
                  : "Enter your phone number"
              }
            />
          </Stack>
          <Menu
            anchorEl={countryMenuAnchor}
            open={isCountryMenuOpen}
            onClose={closeCountryMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            PaperProps={{ sx: { width: 280, maxHeight: 360 } }}
          >
            <Box sx={{ p: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search country or code"
                value={countrySearch}
                onChange={(event) => setCountrySearch(event.target.value)}
                autoFocus
              />
            </Box>
            {filteredCountries.length === 0 && (
              <MenuItem disabled>No matches</MenuItem>
            )}
            {filteredCountries.map((country) => (
              <MenuItem
                key={country.iso2}
                selected={country.dialCode === dialCode}
                onClick={() => handleCountrySelect(country)}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{country.flag}</span>
                  <Typography>{country.name}</Typography>
                  <Typography sx={{ marginLeft: "auto", fontWeight: 600 }}>
                    +{country.dialCode}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </Menu>
          <Button
            variant="contained"
            fullWidth
            onClick={sendOtp}
            disabled={loading || !canSendPhone}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
            sx={{ py: 1.25 }}
          >
            {error ? "Retry Send OTP" : "Send OTP"}
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
                    if (!phone) {
                      setError("Enter a valid phone number.");
                      return;
                    }
                    const num = normalizeE164(phone);
                    if (!num || num.length < 8) {
                      setError("Enter a valid phone number.");
                      return;
                    }
                    // signInWithRedirect is not a supported fallback for
                    // PhoneAuthProvider (it expects OAuth providers).
                    // Show a clear instruction to the user instead of
                    // attempting an unsupported redirect.
                    setError(
                      "Popup blocked. Please allow popups in your browser or try verifying from a different device/browser."
                    );
                  } catch (e) {
                    setError(getErrorMessage(e));
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || !canSendPhone}
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
          <Typography sx={{ mb: 1, color: "#fff" }}>Enter OTP</Typography>
          {phone && (
            <Typography
              sx={{
                mb: 2,
                color: "rgba(255,255,255,0.85)",
                fontSize: 14,
              }}
            >
              Sending OTP to <strong>{phone}</strong>
            </Typography>
          )}
          <Box
            sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 1.5 }}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <TextField
                key={i}
                inputRef={(el: HTMLInputElement | null) => {
                  otpRefs.current[i] = el;
                }}
                inputProps={{
                  inputMode: "numeric",
                  maxLength: 1,
                  style: { textAlign: "center", color: "#fff" },
                  "aria-label": `OTP digit ${i + 1}`,
                }}
                value={otp[i] || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  const next = otp.split("");
                  next[i] = val || "";
                  const joined = next.join("").slice(0, 6);
                  setOtp(joined);
                  // focus next only when we actually received a digit
                  if (val) otpRefs.current[i + 1]?.focus();
                }}
                onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                  try {
                    const pasted = e.clipboardData?.getData("text") || "";
                    const digits = pasted.replace(/\D/g, "").slice(0, 6);
                    if (digits.length === 6) {
                      setOtp(digits);
                      // focus the last box so screen readers know the input completed
                      setTimeout(() => otpRefs.current[5]?.focus(), 0);
                      e.preventDefault();
                    }
                  } catch {}
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace") {
                    e.preventDefault();
                    const chars = otp.split("");
                    if (chars[i]) {
                      chars[i] = "";
                      setOtp(chars.join(""));
                      if (i > 0) otpRefs.current[i - 1]?.focus();
                      else otpRefs.current[i]?.focus();
                      return;
                    }
                    if (i > 0) {
                      const prev = i - 1;
                      chars[prev] = "";
                      setOtp(chars.join(""));
                      otpRefs.current[prev]?.focus();
                    }
                  } else if (e.key === "ArrowLeft" && i > 0) {
                    e.preventDefault();
                    otpRefs.current[i - 1]?.focus();
                  } else if (e.key === "ArrowRight" && i < 5) {
                    e.preventDefault();
                    otpRefs.current[i + 1]?.focus();
                  }
                }}
                sx={{
                  width: 48,
                  "& .MuiInputBase-input": {
                    color: "#fff",
                    textAlign: "center",
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(255,255,255,0.6)" },
                    "&:hover fieldset": { borderColor: "#fff" },
                    "&.Mui-focused fieldset": { borderColor: "#fff" },
                  },
                }}
              />
            ))}
          </Box>
          <Button
            variant="contained"
            fullWidth
            onClick={verifyOtp}
            disabled={loading || otp.length !== 6}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
            sx={{ py: 1.25 }}
          >
            Verify OTP
          </Button>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 1,
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              variant="text"
              onClick={async () => {
                // Resend code (throttled by resendCooldown)
                if (resendCooldown > 0) return;
                try {
                  setError("");
                  await sendOtp();
                } catch (e) {
                  setError(getErrorMessage(e));
                }
              }}
              disabled={resendCooldown > 0 || loading}
            >
              {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend"}
            </Button>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {phone && (
                <Typography
                  sx={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}
                >
                  {phone}
                </Typography>
              )}
              <Button
                variant="text"
                onClick={() => {
                  // change number — go back to phone entry
                  try {
                    resetVerifier();
                  } catch {}
                  setOtp("");
                  setConfirmation(null);
                  setError("");
                  setStep("phone");
                }}
              >
                Change number
              </Button>
            </Box>
          </Box>
        </>
      )}

      {/* Accessible error message with ARIA live region */}
      {error && (
        <Box
          role="alert"
          aria-live="polite"
          aria-atomic="true"
          sx={{ color: "error.main", mt: 2 }}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Hidden screen reader announcer for step changes */}
      <div
        id="phone-auth-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          left: "-10000px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      />
    </Box>
  );
}
