"use client";

import React from "react";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged, type Unsubscribe, type User } from "firebase/auth";
import GoogleProfileCompletionModal from "./GoogleProfileCompletionModal";

export default function ProfileGuard({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [profileInitialPhone, setProfileInitialPhone] = React.useState("");
  const [profileForceComplete, setProfileForceComplete] = React.useState(false);
  const upsertControllerRef = React.useRef<AbortController | null>(null);

  // Track repeated validation/network failures to avoid infinite modal reopen
  // loops on flaky networks. After a few consecutive failures enter a short
  // cooldown where we won't reopen the modal automatically.
  const validationFailuresRef = React.useRef<number>(0);
  const lastValidationFailureAtRef = React.useRef<number | null>(null);
  const VALIDATION_FAILURE_THRESHOLD = 3;
  const VALIDATION_COOLDOWN_MS = 30_000; // 30 seconds

  // Minimal shape for the DB user row that ProfileGuard cares about.
  // Keep it intentionally narrow to avoid coupling to the full DB shape.
  type UserRow = {
    phone?: string | null;
    profile?: { phone?: string | null } | null;
    [key: string]: unknown;
  } | null;

  // Centralized error reporting helper — logs and emits an event so the app
  // can show an in-app toast/snackbar. showToast controls whether the user
  // should be notified immediately.
  const reportError = React.useCallback(
    (message: string, err?: unknown, showToast = false) => {
      try {
        // Keep console output for developers
        console.warn(message, err);
      } catch {}

      try {
        const detail = { message, error: err } as Record<string, unknown>;
        window.dispatchEvent(new CustomEvent("neram:log", { detail }));
        if (showToast) {
          window.dispatchEvent(
            new CustomEvent("neram:toast", { detail: { message } })
          );
        }
      } catch {}
    },
    []
  );

  React.useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const unsub: Unsubscribe = onAuthStateChanged(
      auth,
      async (u: User | null) => {
        if (!mounted) return;
        if (u && u.emailVerified) {
          try {
            // Try to get a fresh token first; fall back to cached token if refresh fails.
            let idToken: string | null = null;
            try {
              idToken = await u.getIdToken(true);
            } catch {
              try {
                idToken = await u.getIdToken();
              } catch (e) {
                reportError(
                  "ProfileGuard: failed to obtain id token",
                  e,
                  false
                );
                idToken = null;
              }
            }
            if (!idToken) {
              // Can't proceed without a token
              return;
            }
            const res = await fetch("/api/session", {
              headers: { Authorization: `Bearer ${idToken}` },
              signal: controller.signal,
            });
            if (!mounted || controller.signal.aborted) return;
            if (!res.ok) {
              // If the session endpoint failed, increment failure counter and
              // avoid opening the modal when failures exceed the threshold.
              validationFailuresRef.current += 1;
              lastValidationFailureAtRef.current = Date.now();
              reportError("ProfileGuard: /api/session returned non-ok", {
                status: res.status,
              });
              if (
                validationFailuresRef.current >= VALIDATION_FAILURE_THRESHOLD
              ) {
                // Enter cooldown and close any modal to avoid reopen loops.
                if (mounted && !controller.signal.aborted) setOpen(false);
                try {
                  window.dispatchEvent(
                    new CustomEvent("neram:toast", {
                      detail: {
                        message:
                          "We’re having trouble validating your session. Please check your connection and try again.",
                      },
                    })
                  );
                } catch {}
              }
              return;
            }

            const j = (await res.json().catch(() => ({}))) as
              | { user?: UserRow }
              | Record<string, unknown>;
            if (!mounted || controller.signal.aborted) return;
            // Successful validation — reset failure counters
            validationFailuresRef.current = 0;
            lastValidationFailureAtRef.current = null;
            const userRow: UserRow = (j && (j as any).user) || null;

            // Read phone from DB (server may store phone in top-level or profile)
            const dbPhone =
              (userRow &&
                ((userRow.phone as string | null | undefined) ??
                  (userRow.profile &&
                    (userRow.profile.phone as string | null | undefined)))) ||
              null;

            // Consider Firebase-linked phone (u.phoneNumber) as proof of phone auth.
            const hasPhone = Boolean(dbPhone || u.phoneNumber);
            const missingPhone = !hasPhone;
            // Only open the modal when the phone number is missing. If the
            // user already has a phone (in DB or on the firebase user), do not
            // show the phone-verification popup even if other profile fields
            // (name/username) are missing.
            if (missingPhone) {
              // If we're in a recent cooldown due to repeated validation failures,
              // avoid automatically opening the modal to prevent annoying loops.
              const lastFailure = lastValidationFailureAtRef.current;
              if (
                lastFailure &&
                Date.now() - lastFailure < VALIDATION_COOLDOWN_MS
              ) {
                // Keep modal closed for now; the user can still open their
                // profile from the UI to retry. Do not spam toasts here.
                if (mounted && !controller.signal.aborted) setOpen(false);
                return;
              }
              const initialPhone =
                (u.phoneNumber as string) || (userRow && userRow.phone) || "";
              if (mounted && !controller.signal.aborted) {
                setProfileInitialPhone(initialPhone);
                // Force completion when phone is missing and firebase user lacks phoneNumber
                setProfileForceComplete(
                  missingPhone && !Boolean(u.phoneNumber)
                );
                setOpen(true);
              }
            } else {
              if (mounted && !controller.signal.aborted) setOpen(false);
            }
          } catch (err: any) {
            // Fetch aborts will throw; ignore abort errors during unmount
            if (err && err.name === "AbortError") return;
            // Network/validation error — increment failure counter and
            // enter cooldown if threshold exceeded.
            validationFailuresRef.current += 1;
            lastValidationFailureAtRef.current = Date.now();
            reportError("ProfileGuard check failed", err, false);
            if (validationFailuresRef.current >= VALIDATION_FAILURE_THRESHOLD) {
              if (mounted && !controller.signal.aborted) setOpen(false);
              try {
                window.dispatchEvent(
                  new CustomEvent("neram:toast", {
                    detail: {
                      message:
                        "We’re having trouble validating your session. Please check your connection and try again.",
                    },
                  })
                );
              } catch {}
            }
          }
        } else {
          if (mounted) setOpen(false);
        }
      }
    );

    return () => {
      mounted = false;
      controller.abort();
      unsub();
    };
  }, [reportError]);

  // ProfileGuard no longer exposes a full profile editor; it only ensures
  // a phone number exists. The modal's onComplete will persist phone.

  // Cleanup any pending upsert fetch when component unmounts
  React.useEffect(() => {
    return () => {
      if (upsertControllerRef.current) {
        upsertControllerRef.current.abort();
        upsertControllerRef.current = null;
      }
    };
  }, []);

  // When forceComplete is true, prevent accidental navigation/close and
  // inform the user that they must complete the required flow.
  React.useEffect(() => {
    if (!profileForceComplete) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      // Standard way to show a browser confirmation dialog on unload.
      e.preventDefault();
      // Most browsers ignore the returned string nowadays, but setting returnValue is required.
      e.returnValue =
        "You have an unfinished required action. Are you sure you want to leave?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [profileForceComplete]);

  return (
    <>
      {children}
      <GoogleProfileCompletionModal
        open={open}
        onClose={() => {
          // When forceComplete is true, block the close and show a clear message.
          if (profileForceComplete) {
            try {
              window.dispatchEvent(
                new CustomEvent("neram:forceCompleteCloseAttempt", {
                  detail: {
                    message:
                      "Please complete the required profile verification before closing this dialog.",
                  },
                })
              );
            } catch {}
            // Fallback: show alert so the user sees why close was blocked.
            if (typeof window !== "undefined") {
              window.alert(
                "Please complete the required profile verification before closing this dialog."
              );
            }
            return;
          }
          setOpen(false);
        }}
        onComplete={async (phone: string) => {
          // Persist phone into DB; ProfileGuard previously saved many fields.
          try {
            const u = auth.currentUser;
            if (!u) throw new Error("Not signed in");
            // Prefer a fresh token for upsert; fall back gracefully.
            let idToken: string | null = null;
            try {
              idToken = await u.getIdToken(true);
            } catch {
              try {
                idToken = await u.getIdToken();
              } catch (e) {
                reportError(
                  "ProfileGuard: failed to obtain id token for upsert",
                  e,
                  true
                );
                idToken = null;
              }
            }
            if (!idToken) throw new Error("Failed to obtain id token");
            // Only send fields we intend to update to avoid accidentally
            // clearing other profile fields on the server. Send only `phone`.
            const payload: Record<string, unknown> = { phone };
            // use AbortController so this request can be cancelled if component unmounts
            upsertControllerRef.current = new AbortController();
            const res = await fetch("/api/users/upsert", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify(payload),
              signal: upsertControllerRef.current.signal,
            });
            const j = await res.json().catch(() => ({}));
            // clear controller after response
            upsertControllerRef.current = null;
            if (res.ok && j && j.ok) {
              setOpen(false);
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
              return true;
            }
          } catch (e) {
            if ((e as any)?.name === "AbortError") {
              // request aborted due to unmount — treat as not completed
              return false;
            }
            reportError("ProfileGuard save failed", e, true);
          }
          return false;
        }}
        forceComplete={profileForceComplete}
        initialPhone={profileInitialPhone || undefined}
      />
    </>
  );
}
