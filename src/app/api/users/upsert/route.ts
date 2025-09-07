import { NextResponse } from "next/server";
import supabaseServer from "../../../../lib/supabaseServer";
import admin from "firebase-admin";

// initialize firebase-admin with service account if not already
if (!admin.apps.length) {
  const credJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (credJson) {
    try {
      const parsed = JSON.parse(credJson);
      admin.initializeApp({ credential: admin.credential.cert(parsed as any) });
    } catch (e) {
      console.warn("Invalid FIREBASE_SERVICE_ACCOUNT_JSON", e);
    }
  }
}

/**
 * POST /api/users/upsert
 * - verifies Firebase ID token (from Authorization header)
 * - ensures decoded.phone_number exists
 * - uses phone as primary lookup: if a user with same phone exists, update it (set firebase_uid), otherwise insert
 * - merges provided profile fields into dedicated columns and unknowns into `profile` jsonb
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

    const phone = (decoded.phone_number || null) as string | null;
    if (!phone) {
      return NextResponse.json(
        { ok: false, error: "Phone not found on token" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const profileFromBody = (body && body.profile) || {};

    // map known columns from token/profile
    const known: Record<string, any> = {
      firebase_uid: decoded.uid,
      phone,
      email: decoded.email || profileFromBody.email || null,
      display_name:
        decoded.name ||
        profileFromBody.display_name ||
        profileFromBody.name ||
        null,
      last_sign_in: body.lastSignIn || null,
    };

    // pick other known profile fields if provided
    const fieldMap: Record<string, string> = {
      father_name: "father_name",
      gender: "gender",
      zip_code: "zip_code",
      city: "city",
      state: "state",
      country: "country",
      instagram_handle: "instagram_handle",
      education_type: "education_type",
      selected_course: "selected_course",
    };

    for (const key of Object.keys(fieldMap)) {
      if (profileFromBody[key] != null) known[key] = profileFromBody[key];
      else if (body[key] != null) known[key] = body[key];
    }

    // remaining fields go into profile jsonb (merge)
    const extra = { ...(profileFromBody || {}), ...(body.extra || {}) };
    // remove known keys from extra
    for (const k of Object.keys(known)) delete extra[k];

    // 1) try find existing user by phone
    const { data: existing, error: selectError } = await supabaseServer
      .from("users")
      .select("*")
      .eq("phone", phone)
      .limit(1)
      .maybeSingle();

    if (selectError) {
      console.error("select error", selectError);
      return NextResponse.json(
        { ok: false, error: selectError.message },
        { status: 500 }
      );
    }

    let user: any = null;

    if (existing) {
      // update existing row -> set firebase_uid (if different) and update provided fields
      const updateObj: Record<string, any> = { ...known };
      // merge extra into profile column
      updateObj.profile = existing.profile || {} || {};
      updateObj.profile = { ...updateObj.profile, ...extra };

      const { data: updated, error: updateError } = await supabaseServer
        .from("users")
        .update(updateObj)
        .eq("phone", phone)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error("update error", updateError);
        return NextResponse.json(
          { ok: false, error: updateError.message },
          { status: 500 }
        );
      }
      user = updated;
    } else {
      // insert new row
      const insertObj: Record<string, any> = { ...known };
      insertObj.profile = { ...extra };
      insertObj.created_at = body.createdAt || new Date().toISOString();

      const { data: inserted, error: insertError } = await supabaseServer
        .from("users")
        .insert([insertObj])
        .select()
        .maybeSingle();

      if (insertError) {
        console.error("insert error", insertError);
        return NextResponse.json(
          { ok: false, error: insertError.message },
          { status: 500 }
        );
      }
      user = inserted;
    }

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    // Some codepaths may throw non-Error values (null, string, undefined).
    // Coerce to a safe string message to avoid an unhelpful `null` runtime error
    // in Next devtools and ensure the client receives a predictable JSON shape.
    const message =
      err instanceof Error ? err.message : String(err ?? "unknown error");
    console.error("/api/users/upsert error:", message, err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
