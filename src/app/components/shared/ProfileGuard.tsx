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
  const [hidePasswordFields, setHidePasswordFields] = React.useState(false);
  const [profileInitialPhone, setProfileInitialPhone] = React.useState("");
  const [profilePhoneVerified, setProfilePhoneVerified] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u && u.emailVerified) {
        try {
          const idToken = await u.getIdToken();
          const res = await fetch("/api/session", {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          const j = await res.json().catch(() => ({}));
          const userRow = j?.user || null;
          const missingName = !(userRow && userRow.student_name);
          // Consider Firebase-linked phone (u.phoneNumber) as proof of phone auth.
          const hasPhone = Boolean((userRow && userRow.phone) || u.phoneNumber);
          const missingPhone = !hasPhone;
          const missingUsername = !(userRow && userRow.username);
          if (missingName || missingPhone || missingUsername) {
            // Determine if the currently-signed-in user originally used
            // email/password (providerId === 'password'); if so, hide the
            // password creation fields in the modal since they already have a password.
            const isPasswordProvider = Array.isArray(u.providerData)
              ? u.providerData.some((p: any) => p?.providerId === "password")
              : false;
            setHidePasswordFields(isPasswordProvider);
            // Save initial phone if available (prefer Firebase phoneNumber)
            const initialPhone =
              (u.phoneNumber as string) || (userRow && userRow.phone) || "";
            setProfileInitialPhone(initialPhone);
            setProfilePhoneVerified(Boolean(u.phoneNumber));
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

  const handleComplete = async ({ studentName, username, phone }: any) => {
    try {
      const u = auth.currentUser;
      if (!u) throw new Error("Not signed in");
      const idToken = await u.getIdToken();
      // Include displayName and profile.student_name so the server maps the
      // provided name into the `student_name` column (server reads displayName
      // or profile.student_name, not top-level student_name).
      const payload = {
        displayName: studentName,
        username,
        phone,
        profile: { student_name: studentName },
      } as Record<string, unknown>;
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
        return true;
      } else {
        console.warn("ProfileGuard upsert failed", res.status, j);
        // keep modal open so user can retry; optionally surface an error
        return false;
      }
    } catch (e) {
      console.warn("ProfileGuard save failed", e);
      return false;
    }
  };

  return (
    <>
      {children}
      <GoogleProfileCompletionModal
        open={open}
        onClose={() => {}}
        onComplete={handleComplete}
        forceComplete={true}
        hidePasswordFields={hidePasswordFields}
        initialPhone={profileInitialPhone || undefined}
        phoneVerified={profilePhoneVerified}
      />
    </>
  );
}
