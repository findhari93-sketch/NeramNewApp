import { NextResponse } from "next/server";
import supabaseServer from "../../../lib/supabaseServer";
import admin from "firebase-admin";

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
        const phone = (decoded.phone_number || null) as string | null;
        const email = (decoded.email || null) as string | null;
        // Lookup user by phone first, then by email if available
        let userRow: Record<string, unknown> | null = null;
        if (phone) {
          const { data } = await supabaseServer
            .from("users")
            .select("*")
            .eq("phone", phone)
            .limit(1)
            .maybeSingle();
          userRow = data || null;
        }
        if (!userRow && email) {
          const { data } = await supabaseServer
            .from("users")
            .select("*")
            .eq("email", email)
            .limit(1)
            .maybeSingle();
          userRow = data || null;
        }
        return NextResponse.json({ ok: true, user: userRow });
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
