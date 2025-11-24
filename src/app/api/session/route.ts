import { NextResponse } from "next/server";
import supabaseServer from "../../../lib/supabaseServer";
import admin from "firebase-admin";
import { mapFromUsersDuplicate, type UsersDuplicateRow } from "../../../lib/userFieldMapping";

// initialize firebase-admin with service account if not already
if (!admin.apps.length) {
  const credJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (credJson) {
    try {
      const parsed = JSON.parse(credJson) as admin.ServiceAccount;
      admin.initializeApp({ credential: admin.credential.cert(parsed) });
    } catch (e) {
      console.warn("Invalid FIREBASE_SERVICE_ACCOUNT_JSON", e);
      // Fallback to discrete env vars if JSON parsing fails
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey) privateKey = privateKey.replace(/\\n/g, "\n");
      if (projectId && clientEmail && privateKey) {
        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });
        } catch (err) {
          console.warn(
            "Failed to init Firebase Admin from discrete envs after JSON parse error",
            err
          );
        }
      }
    }
  } else {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) privateKey = privateKey.replace(/\\n/g, "\n");
    if (projectId && clientEmail && privateKey) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } catch (e) {
        console.warn("Failed to init Firebase Admin from discrete envs", e);
      }
    }
  }
}

export async function GET(req: Request) {
  try {
    // 1) Prefer Firebase Authorization header (phone/Google users)
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const idToken = authHeader.split(" ")[1];
        const decoded = await admin.auth().verifyIdToken(idToken);
        const firebaseUid = decoded.uid as string;
        const phone = (decoded.phone_number || null) as string | null;
        const email = (decoded.email || null) as string | null;

        // Lookup user in users_duplicate table with JSONB structure
        // Priority: firebase_uid > phone > email
        let userRow: UsersDuplicateRow | null = null;

        // First try to find by firebase_uid in account JSONB
        if (firebaseUid) {
          const { data } = await supabaseServer
            .from("users_duplicate")
            .select("*")
            .filter("account->>firebase_uid", "eq", firebaseUid)
            .limit(1)
            .maybeSingle();
          userRow = data as UsersDuplicateRow | null;
        }

        // Fallback to phone in contact JSONB
        if (!userRow && phone) {
          const { data } = await supabaseServer
            .from("users_duplicate")
            .select("*")
            .filter("contact->>phone", "eq", phone)
            .limit(1)
            .maybeSingle();
          userRow = data as UsersDuplicateRow | null;
        }

        // Fallback to email in contact JSONB
        if (!userRow && email) {
          const { data } = await supabaseServer
            .from("users_duplicate")
            .select("*")
            .filter("contact->>email", "ilike", email)
            .limit(1)
            .maybeSingle();
          userRow = data as UsersDuplicateRow | null;
        }

        // MIGRATION FALLBACK: If user not found in users_duplicate, try old users table
        // This prevents existing users from being logged out during migration
        if (!userRow) {
          console.log("[SESSION] User not found in users_duplicate, checking old users table for migration");
          let legacyUserRow: Record<string, unknown> | null = null;

          // Try old table by firebase_uid
          if (firebaseUid) {
            const { data } = await supabaseServer
              .from("users")
              .select("*")
              .eq("firebase_uid", firebaseUid)
              .limit(1)
              .maybeSingle();
            legacyUserRow = data || null;
          }

          // Fallback to phone
          if (!legacyUserRow && phone) {
            const { data } = await supabaseServer
              .from("users")
              .select("*")
              .eq("phone", phone)
              .limit(1)
              .maybeSingle();
            legacyUserRow = data || null;
          }

          // Fallback to email
          if (!legacyUserRow && email) {
            const { data } = await supabaseServer
              .from("users")
              .select("*")
              .eq("email", email)
              .limit(1)
              .maybeSingle();
            legacyUserRow = data || null;
          }

          if (legacyUserRow) {
            console.log("[SESSION] Found user in old users table, returning legacy data");
            // Return legacy user data directly without migration
            return NextResponse.json({ ok: true, user: legacyUserRow });
          }
        }

        // CRITICAL: Reject deleted users - if user not found in either table, return 404
        // This ensures deleted users are signed out immediately on next session check
        if (!userRow) {
          console.warn("[SESSION] User not found in either users_duplicate or users table");
          return NextResponse.json(
            { ok: false, error: "user_not_found" },
            { status: 404 }
          );
        }

        // Map from JSONB structure to flat structure for backward compatibility
        const flatUser = mapFromUsersDuplicate(userRow);
        return NextResponse.json({ ok: true, user: flatUser });
      } catch (e) {
        console.warn("/api/session: token verification failed", e);
        // Dev-only diagnostics to help pinpoint project mismatch or clock issues
        if (process.env.NODE_ENV !== "production") {
          try {
            const raw = authHeader.split(" ")[1] || "";
            const parts = raw.split(".");
            if (parts.length >= 2) {
              const payloadJson = Buffer.from(parts[1], "base64").toString(
                "utf8"
              );
              const payload = JSON.parse(payloadJson);
              console.warn("/api/session token claims:", {
                aud: payload.aud,
                iss: payload.iss,
                sub: payload.sub,
                firebase: payload.firebase,
                expectedProject:
                  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
                  process.env.FIREBASE_PROJECT_ID,
              });
            }
          } catch (diagErr) {
            console.warn("/api/session diagnostics parse failed", diagErr);
          }
        }
        return NextResponse.json(
          { ok: false, error: "invalid_token" },
          { status: 401 }
        );
      }
    }

    // 2) No Firebase token and no fallback supported
    return NextResponse.json(
      { ok: false, error: "no_session" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "exception" },
      { status: 500 }
    );
  }
}
