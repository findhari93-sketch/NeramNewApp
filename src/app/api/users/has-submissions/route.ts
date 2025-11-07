// Returns whether the currently authenticated Firebase user has any
// submitted applications in `users_duplicate`.
import admin from "firebase-admin";
import supabaseServer from "../../../../lib/supabaseServer";

// initialize firebase-admin if not already (reuse pattern from /api/users/me)
if (!admin.apps.length) {
  const credJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (credJson) {
    try {
      const parsed = JSON.parse(credJson) as admin.ServiceAccount;
      admin.initializeApp({ credential: admin.credential.cert(parsed) });
    } catch {
      // ignore and let other env-based init paths handle it
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
        JSON.stringify({ ok: false, error: "Invalid token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const firebaseUid = decoded.uid as string;

    // Query for rows where account->>firebase_uid matches and application_submitted = true
    const { data, error, count } = await supabaseServer
      .from("users_duplicate")
      .select("id", { count: "exact" })
      .filter("account->>firebase_uid", "eq", firebaseUid)
      .filter("application_details->>application_submitted", "eq", "true");

    if (error) {
      console.error("/api/users/has-submissions supabase error:", error);
      return new Response(JSON.stringify({ ok: false, error: String(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const foundCount =
      typeof count === "number" ? count : Array.isArray(data) ? data.length : 0;

    return new Response(
      JSON.stringify({
        ok: true,
        hasSubmissions: foundCount > 0,
        count: foundCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("/api/users/has-submissions error:", err);
    const msg = err instanceof Error ? err.message : String(err ?? "unknown");
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
