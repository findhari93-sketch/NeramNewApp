import { getAuth } from "firebase/auth";
import type { UserRow, UserUpsertPayload } from "../types/db";

export async function saveUserProfile(
  profile: UserUpsertPayload
): Promise<UserRow> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const idToken = await user.getIdToken(true);

  const res = await fetch("/api/users/upsert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ profile }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`upsert failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "upsert failed");
  return json.user as UserRow;
}

export default saveUserProfile;
