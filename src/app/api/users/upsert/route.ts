import { NextResponse } from "next/server";
import supabaseServer from "../../../../lib/supabaseServer";
import admin from "firebase-admin";
import type { UserRow } from "../../../../types/db";
import crypto from "crypto";

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

/**
 * POST /api/users/upsert
 * - verifies Firebase ID token (from Authorization header)
 * - ensures decoded.phone_number exists
 * - uses phone as primary lookup: if a user with same phone exists, update it; otherwise insert
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

    const firebaseUid = decoded.uid as string;
    const phone = (decoded.phone_number || null) as string | null;
    if (!phone) {
      return NextResponse.json(
        { ok: false, error: "Phone not found on token" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const profileFromBody: Record<string, unknown> =
      body &&
      typeof body === "object" &&
      (body as Record<string, unknown>).profile &&
      typeof (body as Record<string, unknown>).profile === "object"
        ? ((body as Record<string, unknown>).profile as Record<string, unknown>)
        : {};

    // map known columns from token/profile
    const emailFromBody = (() => {
      const fromTop =
        typeof (body as Record<string, unknown>)["email"] === "string"
          ? ((body as Record<string, unknown>)["email"] as string)
          : null;
      const fromProfile =
        typeof (profileFromBody as Record<string, unknown>)["email"] ===
        "string"
          ? ((profileFromBody as Record<string, unknown>)["email"] as string)
          : null;
      return fromTop ?? fromProfile ?? null;
    })();

    const displayNameFromBody = (() => {
      const fromTop =
        typeof (body as Record<string, unknown>)["displayName"] === "string"
          ? ((body as Record<string, unknown>)["displayName"] as string)
          : typeof (body as Record<string, unknown>)["display_name"] ===
            "string"
          ? ((body as Record<string, unknown>)["display_name"] as string)
          : null;
      const fromProfileDisplayName =
        typeof (profileFromBody as Record<string, unknown>)["student_name"] ===
        "string"
          ? ((profileFromBody as Record<string, unknown>)[
              "student_name"
            ] as string)
          : null;
      const fromProfileName =
        typeof (profileFromBody as Record<string, unknown>)["name"] === "string"
          ? ((profileFromBody as Record<string, unknown>)["name"] as string)
          : null;
      return fromTop ?? fromProfileDisplayName ?? fromProfileName ?? null;
    })();

    // derive sign-in context
    const signInProvider: string | null = (() => {
      try {
        const fb = (
          decoded as unknown as { firebase?: { sign_in_provider?: string } }
        ).firebase;
        if (fb && typeof fb.sign_in_provider === "string")
          return fb.sign_in_provider;
      } catch {}
      return null;
    })();
    const lastSignInIso: string = (() => {
      const t = (decoded as unknown as { auth_time?: number }).auth_time;
      if (typeof t === "number" && Number.isFinite(t))
        return new Date(t * 1000).toISOString();
      return new Date().toISOString();
    })();

    const known: Partial<UserRow> & Record<string, unknown> = {
      firebase_uid: firebaseUid,
      phone,
      email: (decoded.email as string | undefined) ?? emailFromBody ?? null,
      student_name:
        (decoded.name as string | undefined) ?? displayNameFromBody ?? null,
      last_sign_in: lastSignInIso,
      // tentative phone flag (may be further merged with existing row on update)
      phone_auth_used: !!phone || signInProvider === "phone",
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
      if ((profileFromBody as Record<string, unknown>)[key] != null)
        (known as Record<string, unknown>)[key] = (
          profileFromBody as Record<string, unknown>
        )[key];
      else if ((body as Record<string, unknown>)[key] != null)
        (known as Record<string, unknown>)[key] = (
          body as Record<string, unknown>
        )[key];
    }

    // remaining fields go into profile jsonb (merge)
    type UnknownRecord = Record<string, unknown>;
    const bodyAsRecord: UnknownRecord =
      body && typeof body === "object" ? (body as UnknownRecord) : {};
    const extraFromBody: UnknownRecord =
      bodyAsRecord["extra"] && typeof bodyAsRecord["extra"] === "object"
        ? (bodyAsRecord["extra"] as UnknownRecord)
        : {};
    const extra: Record<string, unknown> = {
      ...(profileFromBody || {}),
      ...extraFromBody,
    };
    // remove known keys from extra
    for (const k of Object.keys(known)) delete extra[k];

    // Normalize and map common camelCase -> snake_case fields from top-level body
    const fromAny = (...vals: unknown[]) => {
      for (const v of vals) if (v !== undefined) return v;
      return undefined;
    };

    // Gender normalizer to match enum gender_t
    const normalizeGender = (
      val: unknown
    ): "male" | "female" | "nonbinary" | "prefer_not_to_say" | null => {
      if (typeof val !== "string") return null;
      const s = val.trim().toLowerCase();
      if (["male", "m"].includes(s)) return "male";
      if (["female", "f"].includes(s)) return "female";
      if (["nonbinary", "non-binary", "non binary", "nb"].includes(s))
        return "nonbinary";
      if (
        [
          "prefer_not_to_say",
          "prefer not to say",
          "na",
          "n/a",
          "none",
        ].includes(s)
      )
        return "prefer_not_to_say";
      return null;
    };

    const bodyRec = bodyAsRecord;
    const genderIncoming = fromAny(
      bodyRec["gender"],
      (profileFromBody as Record<string, unknown>)["gender"]
    );
    const genderNormalized = normalizeGender(genderIncoming);
    if (genderNormalized !== null)
      (known as Partial<UserRow>).gender =
        genderNormalized as UserRow["gender"];

    const fatherNameIncoming = fromAny(
      bodyRec["fatherName"],
      bodyRec["father_name"],
      (profileFromBody as Record<string, unknown>)["father_name"]
    );
    if (fatherNameIncoming !== undefined)
      (known as Partial<UserRow>).father_name = fatherNameIncoming as string;

    const zipIncoming = fromAny(
      bodyRec["zipCode"],
      bodyRec["zip_code"],
      (profileFromBody as Record<string, unknown>)["zip_code"]
    );
    if (zipIncoming !== undefined)
      (known as Partial<UserRow>).zip_code = zipIncoming as string;

    const instaIncoming = fromAny(
      bodyRec["instagram"],
      bodyRec["instagramId"],
      (profileFromBody as Record<string, unknown>)["instagram_handle"]
    );
    if (instaIncoming !== undefined)
      (known as Partial<UserRow>).instagram_handle = instaIncoming as string;

    const eduIncoming = fromAny(
      bodyRec["educationType"],
      bodyRec["education_type"],
      (profileFromBody as Record<string, unknown>)["education_type"]
    );
    if (eduIncoming !== undefined)
      (known as Partial<UserRow>).education_type = eduIncoming as string;

    const courseIncoming = fromAny(
      bodyRec["selectedCourse"],
      bodyRec["selected_course"],
      (profileFromBody as Record<string, unknown>)["selected_course"]
    );
    if (courseIncoming !== undefined)
      (known as Partial<UserRow>).selected_course = courseIncoming as string;

    const feeIncoming = fromAny(bodyRec["courseFee"], bodyRec["course_fee"]);
    if (feeIncoming !== undefined)
      (known as Partial<UserRow>).course_fee = feeIncoming as number;

    const discountIncoming = fromAny(
      bodyRec["discount"],
      bodyRec["discount_amount"]
    );
    if (discountIncoming !== undefined)
      (known as Partial<UserRow>).discount = discountIncoming as number;

    const paymentTypeIncoming = fromAny(
      bodyRec["paymentType"],
      bodyRec["payment_type"]
    );
    if (paymentTypeIncoming !== undefined)
      (known as Partial<UserRow>).payment_type = paymentTypeIncoming as string;

    const totalPayableIncoming = fromAny(
      bodyRec["totalPayable"],
      bodyRec["total_payable"]
    );
    if (totalPayableIncoming !== undefined)
      (known as Partial<UserRow>).total_payable =
        totalPayableIncoming as number;

    // Prepare application JSON merge
    const applicationFromBody =
      bodyRec["application"] && typeof bodyRec["application"] === "object"
        ? (bodyRec["application"] as Record<string, unknown>)
        : {};

    // Extract education section from application payload
    const educationSection: Record<string, unknown> | undefined =
      applicationFromBody &&
      typeof (applicationFromBody as Record<string, unknown>)["education"] ===
        "object"
        ? ((applicationFromBody as Record<string, unknown>)[
            "education"
          ] as Record<string, unknown>)
        : undefined;

    // Helper to parse academic-year-like values to a start-year integer
    const parseStartYear = (val: unknown): number | undefined => {
      if (typeof val === "number" && Number.isFinite(val)) return val;
      if (typeof val === "string") {
        const m = val.match(/(\d{4})/);
        if (m) return Number(m[1]);
      }
      return undefined;
    };

    // Map education fields to dedicated columns, respecting education_type
    let educationType = (known as Partial<UserRow>).education_type as
      | string
      | undefined;
    // If not provided at top-level, try to pick from the application section
    if (!educationType && educationSection) {
      const t = educationSection["educationType"];
      if (typeof t === "string") {
        educationType = t;
        (known as Partial<UserRow>).education_type = t;
      }
    }
    // Common field: record NATA attempt year if present even when type is undefined
    if (educationSection) {
      const nataAttempt = parseStartYear(educationSection["nataAttemptYear"]);
      if (nataAttempt !== undefined) {
        (known as Partial<UserRow>).nata_attempt_year = nataAttempt;
      }
    }
    if (educationType && educationSection) {
      // Clear all specific columns first, then set per type to prevent stale data
      (known as Partial<UserRow>).school_std = null;
      (known as Partial<UserRow>).board = null;
      (known as Partial<UserRow>).board_year = null;
      (known as Partial<UserRow>).school_name = null;
      (known as Partial<UserRow>).college_name = null;
      (known as Partial<UserRow>).college_year = null;
      (known as Partial<UserRow>).diploma_course = null;
      (known as Partial<UserRow>).diploma_year = null;
      (known as Partial<UserRow>).diploma_college = null;
      (known as Partial<UserRow>).other_description = null;

      if (educationType === "school") {
        if (typeof educationSection["schoolStd"] === "string")
          (known as Partial<UserRow>).school_std = educationSection[
            "schoolStd"
          ] as string;
        if (typeof educationSection["board"] === "string")
          (known as Partial<UserRow>).board = educationSection[
            "board"
          ] as string;
        const by = parseStartYear(educationSection["boardYear"]);
        if (by !== undefined) (known as Partial<UserRow>).board_year = by;
        if (typeof educationSection["schoolName"] === "string")
          (known as Partial<UserRow>).school_name = educationSection[
            "schoolName"
          ] as string;
      } else if (educationType === "college") {
        if (typeof educationSection["collegeName"] === "string")
          (known as Partial<UserRow>).college_name = educationSection[
            "collegeName"
          ] as string;
        if (typeof educationSection["collegeYear"] === "string")
          (known as Partial<UserRow>).college_year = educationSection[
            "collegeYear"
          ] as string;
      } else if (educationType === "diploma") {
        if (typeof educationSection["diplomaCourse"] === "string")
          (known as Partial<UserRow>).diploma_course = educationSection[
            "diplomaCourse"
          ] as string;
        if (typeof educationSection["diplomaYear"] === "string")
          (known as Partial<UserRow>).diploma_year = educationSection[
            "diplomaYear"
          ] as string;
        if (typeof educationSection["diplomaCollege"] === "string")
          (known as Partial<UserRow>).diploma_college = educationSection[
            "diplomaCollege"
          ] as string;
      } else if (educationType === "other") {
        if (typeof educationSection["otherDescription"] === "string")
          (known as Partial<UserRow>).other_description = educationSection[
            "otherDescription"
          ] as string;
      }
    }

    // 1) try find existing user by firebase_uid, fallback to phone
    let existing: UserRow | null = null;
    let selectError: unknown = null;
    if (firebaseUid) {
      const r1 = await supabaseServer
        .from("users")
        .select("*")
        .eq("firebase_uid", firebaseUid)
        .limit(1)
        .maybeSingle();
      existing = (r1.data as unknown as UserRow) ?? null;
      selectError = r1.error;
      if (!selectError && !existing && phone) {
        const r2 = await supabaseServer
          .from("users")
          .select("*")
          .eq("phone", phone)
          .limit(1)
          .maybeSingle();
        existing = (r2.data as unknown as UserRow) ?? null;
        selectError = r2.error;
      }
    } else {
      const r = await supabaseServer
        .from("users")
        .select("*")
        .eq("phone", phone)
        .limit(1)
        .maybeSingle();
      existing = (r.data as unknown as UserRow) ?? null;
      selectError = r.error;
    }

    if (selectError) {
      console.error("select error", selectError);
      const errMsg =
        selectError &&
        typeof selectError === "object" &&
        "message" in selectError
          ? String(
              (selectError as { message?: unknown }).message || "select error"
            )
          : String(selectError);
      return NextResponse.json({ ok: false, error: errMsg }, { status: 500 });
    }

    let user: UserRow | null = null;

    const existingRow = existing as unknown as UserRow | null;
    if (existingRow) {
      // update existing row -> update provided fields
      const updateObj: Partial<UserRow> & Record<string, unknown> = {
        ...known,
      };
      // ensure we control profile explicitly
      delete (updateObj as Record<string, unknown>)["profile"];
      // do not attempt to change primary key id on update
      delete (updateObj as Record<string, unknown>)["id"];
      // merge extra into profile column
      const currentProfile: Record<string, unknown> =
        (existingRow.profile as Record<string, unknown>) || {};
      (updateObj as Partial<UserRow>).profile = {
        ...currentProfile,
        ...extra,
      } as Record<string, unknown>;

      // Merge application JSON if provided
      const currentApp: Record<string, unknown> =
        (existingRow.application as Record<string, unknown>) || {};
      if (Object.keys(applicationFromBody).length > 0) {
        (updateObj as Partial<UserRow>).application = {
          ...currentApp,
          ...applicationFromBody,
        } as Record<string, unknown>;
      }

      // Merge providers: ensure we record current sign-in provider
      const existingProviders = Array.isArray(existingRow.providers)
        ? (existingRow.providers as unknown[])
        : [];
      const providerStrings = existingProviders.filter(
        (v) => typeof v === "string"
      ) as string[];
      const provSet = new Set<string>(providerStrings);
      if (signInProvider) provSet.add(signInProvider);
      (updateObj as Partial<UserRow>).providers = Array.from(provSet);

      // Preserve phone_auth_used once true
      const alreadyPhone = Boolean(existingRow.phone_auth_used);
      (updateObj as Partial<UserRow>).phone_auth_used =
        alreadyPhone || !!phone || signInProvider === "phone";

      // choose a stable filter for update
      const updateQuery = supabaseServer.from("users").update(updateObj);
      if (existingRow.firebase_uid) {
        updateQuery.eq("firebase_uid", existingRow.firebase_uid);
      } else {
        updateQuery.eq("phone", phone);
      }
      const { data: updated, error: updateError } = await updateQuery
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
      const insertObj: Partial<UserRow> & Record<string, unknown> = {
        ...known,
      };
      // allow database default to generate UUID id; as a fallback, generate one here if needed
      (insertObj as Partial<UserRow>).id = crypto.randomUUID();
      (insertObj as Partial<UserRow>).profile = { ...extra } as Record<
        string,
        unknown
      >;
      // application JSON on insert
      if (Object.keys(applicationFromBody).length > 0) {
        (insertObj as Partial<UserRow>).application = {
          ...applicationFromBody,
        } as Record<string, unknown>;
      }

      (insertObj as Partial<UserRow>).created_at =
        ((body as Record<string, unknown>).createdAt as string) ||
        new Date().toISOString();

      // Initialize providers and phone flag
      (insertObj as Partial<UserRow>).providers = signInProvider
        ? [signInProvider]
        : [];
      (insertObj as Partial<UserRow>).phone_auth_used =
        !!phone || signInProvider === "phone";

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
