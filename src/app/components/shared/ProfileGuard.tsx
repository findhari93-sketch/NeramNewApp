"use client";

import React from "react";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import GoogleProfileCompletionModal from "./GoogleProfileCompletionModal";

export default function ProfileGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [profileInitialPhone, setProfileInitialPhone] = React.useState("");
  const [profileForceComplete, setProfileForceComplete] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u && u.emailVerified) {
        try {
          const idToken = await u.getIdToken();
          const res = await fetch("/api/session", {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (!res.ok) {
            // If the session endpoint failed, log and don't open the modal (avoid false positives)
            console.warn(
              "ProfileGuard: /api/session returned non-ok",
              res.status
            );
            return;
          }

          const j = await res.json().catch(() => ({}));
          const userRow = j?.user || null;

          // Read phone from DB (server may store phone in top-level or profile)
          const dbPhone =
            (userRow &&
              (userRow.phone ?? (userRow.profile && userRow.profile.phone))) ||
            null;

          // Consider Firebase-linked phone (u.phoneNumber) as proof of phone auth.
          const hasPhone = Boolean(dbPhone || u.phoneNumber);
          const missingPhone = !hasPhone;
          // Only open the modal when the phone number is missing. If the
          // user already has a phone (in DB or on the firebase user), do not
          // show the phone-verification popup even if other profile fields
          // (name/username) are missing.
          if (missingPhone) {
            const initialPhone =
              (u.phoneNumber as string) || (userRow && userRow.phone) || "";
            setProfileInitialPhone(initialPhone);
            // Force completion when phone is missing and firebase user lacks phoneNumber
            setProfileForceComplete(missingPhone && !Boolean(u.phoneNumber));
            setOpen(true);
          } else {
            setOpen(false);
          }
        } catch (err) {
          console.warn("ProfileGuard check failed", err);
        }
      } else {
        setOpen(false);
      }
    });
    return () => unsub();
  }, []);

  // ProfileGuard no longer exposes a full profile editor; it only ensures
  // a phone number exists. The modal's onComplete will persist phone.

  return (
    <>
      {children}
      <GoogleProfileCompletionModal
        open={open}
        onClose={() => {}}
        onComplete={async (phone: string) => {
          // Persist phone into DB; ProfileGuard previously saved many fields.
          try {
            const u = auth.currentUser;
            if (!u) throw new Error("Not signed in");
            const idToken = await u.getIdToken();
            const payload: Record<string, unknown> = {
              phone,
              // preserve student_name if available in profileInitialPhone flow
              profile: { student_name: undefined },
            };
            const res = await fetch("/api/users/upsert", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify(payload),
            });
            const j = await res.json().catch(() => ({}));
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
            console.warn("ProfileGuard save failed", e);
          }
          return false;
        }}
        forceComplete={profileForceComplete}
        initialPhone={profileInitialPhone || undefined}
      />
    </>
  );
}
