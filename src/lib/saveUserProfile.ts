import { getAuth } from "firebase/auth";
import type { UserRow, UserUpsertPayload } from "../types/db";

export async function saveUserProfile(
  profile: UserUpsertPayload
): Promise<UserRow> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const idToken = await user.getIdToken(true);

  let res: Response;
  try {
    res = await fetch("/api/users/upsert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ profile }),
    });
  } catch (e) {
    throw new Error(`network error: ${String(e ?? "unknown error")}`);
  }

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
