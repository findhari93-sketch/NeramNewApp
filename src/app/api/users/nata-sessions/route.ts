import { NextResponse } from "next/server";
import supabaseServer from "../../../../lib/supabaseServer";
import admin from "firebase-admin";

// Initialize firebase-admin if not already (reuse logic from other routes)
if (!admin.apps.length) {
  const credJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (credJson) {
    try {
      const parsed = JSON.parse(credJson) as admin.ServiceAccount;
      admin.initializeApp({ credential: admin.credential.cert(parsed) });
    } catch {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey) privateKey = privateKey.replace(/\n/g, "\n");
      if (projectId && clientEmail && privateKey) {
        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });
        } catch {}
      }
    }
  } else {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) privateKey = privateKey.replace(/\n/g, "\n");
    if (projectId && clientEmail && privateKey) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } catch {}
    }
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing Authorization" },
        { status: 401 }
      );
    }
    const idToken = authHeader.split(" ")[1];
    let decoded: admin.auth.DecodedIdToken | null = null;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }
    if (!decoded) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    const { data, error } = await supabaseServer
      .from("users")
      .select("nata_calculator_sessions")
      .eq("firebase_uid", decoded.uid)
      .maybeSingle();
    if (error) {
      return NextResponse.json(
        { error: String(error.message || error) },
        { status: 500 }
      );
    }
    const sessions = (data && (data as any).nata_calculator_sessions) || {};
    return NextResponse.json({ sessions });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : String(err ?? "unknown error");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
