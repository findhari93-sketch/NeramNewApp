// Minimal handler for /api/users/me to ensure this file is a module and
// TypeScript/route-type generation doesn't treat it as an empty module.
// This endpoint intentionally returns a lightweight JSON response. Replace
// with a proper authenticated user lookup if you need full functionality.
import admin from "firebase-admin";
import supabaseServer from "../../../../lib/supabaseServer";
import {
  mapFromUsersDuplicate,
  type UsersDuplicateRow,
} from "../../../../lib/userFieldMapping";

// initialize firebase-admin if not already (reuse pattern from upsert)
if (!admin.apps.length) {
  const credJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (credJson) {
    try {
      const parsed = JSON.parse(credJson) as admin.ServiceAccount;
      admin.initializeApp({ credential: admin.credential.cert(parsed) });
    } catch {
      // ignore; other env-based init may be present in server
    }
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing Authorization" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const idToken = authHeader.split(" ")[1];
    let decoded: admin.auth.DecodedIdToken | null = null;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    if (!decoded) {
      return new Response(
        JSON.stringify({ ok: false, error: "invalid token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const firebaseUid = decoded.uid as string;
    // lookup by firebase_uid in users_duplicate table
    const { data, error } = await supabaseServer
      .from("users_duplicate")
      .select("*")
      .filter("account->>firebase_uid", "eq", firebaseUid)
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("/api/users/me select error", error);
      return new Response(JSON.stringify({ ok: false, error: String(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Map to flat structure for backward compatibility
    const flatUser = data
      ? mapFromUsersDuplicate(data as UsersDuplicateRow)
      : null;

    return new Response(JSON.stringify({ ok: true, user: flatUser }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err ?? "unknown");
    console.error("/api/users/me error", err);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
