import { getAuth } from "firebase/auth";
import type {
  NataCalculatorSession,
  NataCalculatorSessionsMap,
  UserRow,
} from "../types/db";

/**
 * Saves a NATA calculator session under users.profile.nata_calculator_sessions
 * using the existing POST /api/users/upsert route. The route will deep-merge
 * this key, preserving previous sessions.
 */
export async function saveNataCalculatorSession(
  session: NataCalculatorSession
): Promise<UserRow> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const idToken = await user.getIdToken(true);

  // Wrap in sessions map keyed by id for merge-safety
  const sessions: NataCalculatorSessionsMap = { [session.id]: session };

  const res = await fetch("/api/users/upsert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      // Server will deep-merge this map into users.nata_calculator_sessions
      nata_calculator_sessions: sessions,
    }),
  });

  if (!res.ok) {
    let text = "";
    try {
      text = await res.text();
    } catch {}
    throw new Error(`upsert failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as {
    ok?: boolean;
    error?: string;
    user?: UserRow;
  };
  if (!json.ok) throw new Error(json.error || "upsert failed");
  return json.user as UserRow;
}

export default saveNataCalculatorSession;
