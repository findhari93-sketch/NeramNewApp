import { NextResponse } from "next/server";
import admin from "firebase-admin";
import supabaseServer from "../../../../lib/supabaseServer";

// initialize firebase-admin if not already (same pattern as other routes)
if (!admin.apps.length) {
  const credJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (credJson) {
    try {
      const parsed = JSON.parse(credJson) as admin.ServiceAccount;
      admin.initializeApp({ credential: admin.credential.cert(parsed) });
    } catch (e) {
      console.warn("Invalid FIREBASE_SERVICE_ACCOUNT_JSON", e);
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
          console.warn("Failed to init Firebase Admin from discrete envs", err);
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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const idToken = body?.idToken;
    if (!idToken)
      return NextResponse.json(
        { ok: false, error: "missing_id_token" },
        { status: 400 }
      );
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      // Optionally return a supabase user row similar to /api/session
      const phone = (decoded.phone_number || null) as string | null;
      const email = (decoded.email || null) as string | null;
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
      // Create a custom token so the client can sign in silently with
      // signInWithCustomToken. This lets the client re-establish auth state
      // after Firebase's hosted action page consumed the oobCode.
      try {
        const customToken = await admin.auth().createCustomToken(decoded.uid);
        return NextResponse.json({
          ok: true,
          uid: decoded.uid,
          email: decoded.email || null,
          phone: decoded.phone_number || null,
          user: userRow,
          customToken,
        });
      } catch (e) {
        console.warn("/api/auth/restore-session createCustomToken failed", e);
        return NextResponse.json({
          ok: true,
          uid: decoded.uid,
          email: decoded.email || null,
          phone: decoded.phone_number || null,
          user: userRow,
        });
      }
    } catch (e) {
      console.warn("/api/auth/restore-session verify failed", e);
      return NextResponse.json(
        { ok: false, error: "invalid_token" },
        { status: 401 }
      );
    }
  } catch (e) {
    console.error("/api/auth/restore-session error", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
