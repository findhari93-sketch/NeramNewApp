import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import supabaseServer from "../../../../lib/supabaseServer";
import admin from "firebase-admin";
import {
  mapToUsersDuplicate,
  mergeUsersDuplicateUpdate,
  mapFromUsersDuplicate,
  type UsersDuplicateRow,
} from "../../../../lib/userFieldMapping";

// initialize firebase-admin with service account if not already
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

/**
 * POST /api/users/upsert
 * - verifies Firebase ID token (from Authorization header)
 * - uses firebase_uid as primary lookup; falls back to phone, then email
 * - merges provided profile fields into grouped JSONB columns
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { ok: false, error: "Missing Authorization" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split(" ")[1];
    let decoded: admin.auth.DecodedIdToken | null = null;

    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      console.warn("Invalid ID token", e);
      return NextResponse.json(
        { ok: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    if (!decoded) {
      return NextResponse.json(
        { ok: false, error: "invalid token" },
        { status: 401 }
      );
    }

    const firebaseUid = decoded.uid as string;
    const phone = (decoded.phone_number || null) as string | null;
    const body = await req.json().catch(() => ({}));

    // Derive sign-in context
    const signInProvider: string | null = (() => {
      try {
        const firebase = (decoded as any).firebase;
        if (firebase?.sign_in_provider) return firebase.sign_in_provider;
      } catch {}
      return null;
    })();

    const lastSignInIso: string = (() => {
      const t = (decoded as any).auth_time;
      if (typeof t === "number" && Number.isFinite(t)) {
        return new Date(t * 1000).toISOString();
      }
      return new Date().toISOString();
    })();

    // Build the update payload from body
    const updates: Record<string, any> = {
      ...body,
      firebase_uid: firebaseUid,
      firebaseUid: firebaseUid,
      email: (decoded.email as string | undefined) ?? body.email ?? null,
      phone: phone || body.phone || null,
      last_sign_in: lastSignInIso,
      lastSignIn: lastSignInIso,
      phone_auth_used:
        !!phone || signInProvider === "phone" || body.phone_auth_used,
      phoneAuthUsed:
        !!phone || signInProvider === "phone" || body.phoneAuthUsed,
    };

    // Add display name from token if not provided
    if (decoded.name && !updates.student_name && !updates.display_name) {
      updates.display_name = decoded.name;
      updates.displayName = decoded.name;
    }

    // Add providers array
    if (signInProvider) {
      const existingProviders = Array.isArray(body.providers)
        ? body.providers
        : [];
      if (!existingProviders.includes(signInProvider)) {
        updates.providers = [...existingProviders, signInProvider];
      }
    }

    // 1) Try to find existing user by firebase_uid
    let existing: UsersDuplicateRow | null = null;

    if (firebaseUid) {
      const r1 = await supabaseServer
        .from("users_duplicate")
        .select("*")
        .filter("account->>firebase_uid", "eq", firebaseUid)
        .limit(1)
        .maybeSingle();
      existing = r1.data as UsersDuplicateRow | null;

      // Fallback to phone if no firebase_uid match
      if (!existing && phone) {
        const r2 = await supabaseServer
          .from("users_duplicate")
          .select("*")
          .filter("contact->>phone", "eq", phone)
          .limit(1)
          .maybeSingle();
        existing = r2.data as UsersDuplicateRow | null;
      }

      // Fallback to email if no phone match
      if (!existing && decoded.email) {
        const r3 = await supabaseServer
          .from("users_duplicate")
          .select("*")
          .filter("contact->>email", "ilike", decoded.email)
          .limit(1)
          .maybeSingle();
        existing = r3.data as UsersDuplicateRow | null;
      }
    }

    let user: UsersDuplicateRow | null = null;

    if (existing) {
      // UPDATE existing user
      const merged = mergeUsersDuplicateUpdate(existing, updates);

      // Ensure we preserve the ID
      merged.id = existing.id;

      const { data, error } = await supabaseServer
        .from("users_duplicate")
        .update(merged)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("Update error:", error);
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 }
        );
      }

      user = data as UsersDuplicateRow;
    } else {
      // INSERT new user
      const mapped = mapToUsersDuplicate(updates);

      // Generate ID if not provided
      if (!mapped.id) {
        mapped.id = randomUUID();
      }

      const { data, error } = await supabaseServer
        .from("users_duplicate")
        .insert(mapped)
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 }
        );
      }

      user = data as UsersDuplicateRow;
    }

    // Return flat structure for backward compatibility
    const flatUser = mapFromUsersDuplicate(user);

    return NextResponse.json({ ok: true, user: flatUser });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : String(err ?? "unknown error");
    console.error("/api/users/upsert error:", message, err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
