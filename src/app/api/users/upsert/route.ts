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

    const body = await req.json();
    if (!body || !body.uid)
      return NextResponse.json(
        { ok: false, error: "missing uid" },
        { status: 400 }
      );
    if (decoded.uid !== body.uid)
      return NextResponse.json(
        { ok: false, error: "uid mismatch" },
        { status: 403 }
      );

    const courseFee = body.courseFee != null ? Number(body.courseFee) : null;
    const discount = body.discount != null ? Number(body.discount) : 0;
    const totalPayable =
      body.totalPayable != null ? Number(body.totalPayable) : null;

    const row = {
      id: body.uid,
      email: body.email || null,
      phone: body.phone || null,
      display_name: body.displayName || null,
      father_name: body.fatherName || null,
      gender: body.gender || null,
      zip_code: body.zipCode || null,
      city: body.city || null,
      state: body.state || null,
      country: body.country || null,
      instagram_handle: body.instagram || null,
      education_type: body.educationType || null,
      selected_course: body.selectedCourse || null,
      course_fee: courseFee,
      discount: discount,
      payment_type: body.paymentType || null,
      total_payable: totalPayable,
      created_at: body.createdAt || new Date().toISOString(),
      last_sign_in: body.lastSignIn || null,
      providers: body.providers || null,
      phone_auth_used: body.phoneAuth === true ? true : false,
      google_info: body.google || null,
      linkedin_info: body.linkedin || null,
      profile: body.profile || {},
      application: body.application || {},
    };

    const { error } = await supabaseServer
      .from("users")
      .upsert(row, { onConflict: "id" });
    if (error) {
      console.error("supabase upsert error", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
