// lib/saveUserProfile.ts
import { auth } from "./firebase";
import type { UserRow, UserUpsertPayload } from "../types/db";

export async function saveUserProfile(profile: Partial<UserUpsertPayload>): Promise<UserRow> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("No authenticated user found");
  }

  // Get fresh ID token
  const idToken = await currentUser.getIdToken(true);

  const response = await fetch("/api/users/upsert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idToken,
      profile,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.user;
}