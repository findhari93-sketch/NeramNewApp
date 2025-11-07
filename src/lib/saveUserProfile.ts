import { getAuth } from "firebase/auth";
import apiClient from "./apiClient";
import type { UserRow, UserUpsertPayload } from "../types/db";

export async function saveUserProfile(
  profile: UserUpsertPayload
): Promise<UserRow> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  await user.getIdToken(true); // ensure token is fresh (apiClient will fetch again if needed)

  // use apiClient which will attach Authorization header and handle token refresh
  const res = await apiClient("/api/users/upsert", {
    method: "POST",
    body: JSON.stringify({ profile }),
  });

  if (!res.ok) {
    let text = "";
    try {
      text = await res.text();
    } catch {}
    throw new Error(`upsert failed: ${res.status} ${text}`);
  }
  let json: { ok?: boolean; error?: string; user?: UserRow };
  try {
    json = await res.json();
  } catch (e) {
    throw new Error(`invalid json: ${String(e ?? "unknown error")}`);
  }
  if (!json?.ok) throw new Error(json?.error || "upsert failed");
  return json.user as UserRow;
}

export default saveUserProfile;
