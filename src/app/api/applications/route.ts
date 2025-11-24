import { NextResponse } from "next/server";
import supabaseServer from "../../../lib/supabaseServer";
import admin from "firebase-admin";
import {
  mapFromUsersDuplicate,
  type UsersDuplicateRow,
} from "../../../lib/userFieldMapping";

// Initialize firebase-admin with service account if not already
if (!admin.apps.length) {
  const credJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (credJson) {
    try {
      const parsed = JSON.parse(credJson) as admin.ServiceAccount;
      admin.initializeApp({ credential: admin.credential.cert(parsed) });
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", e);
    }
  }
}

/**
 * GET /api/applications
 * Returns a list of submitted applications for the current logged-in user.
 * Response: [{ id, data, submitted_at, status, payment_status }, ...]
 */
export async function GET(req: Request) {
  try {
    // Get Firebase user from authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    let firebaseUid: string;
    try {
      const idToken = authHeader.split(" ")[1];
      const decoded = await admin.auth().verifyIdToken(idToken);
      firebaseUid = decoded.uid;
    } catch (e) {
      console.error("GET /api/applications: token verification failed", e);
      return NextResponse.json(
        { error: "Invalid authorization token" },
        { status: 401 }
      );
    }

    // Query rows where:
    // 1. account->firebase_uid matches the current user
    // 2. application_details.application_submitted = true
    const { data, error } = await supabaseServer
      .from("users_duplicate")
      .select("*")
      .filter("account->>firebase_uid", "eq", firebaseUid)
      .filter("application_details->>application_submitted", "eq", "true");

    if (error) {
      console.error("GET /api/applications supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data || []) as UsersDuplicateRow[];

    const out = rows.map((r) => {
      const flat = mapFromUsersDuplicate(r as UsersDuplicateRow);
      const appDetails = (r as any).application_details || {};
      const finalFee = (r as any).final_fee_payment || {};

      return {
        id: r.id,
        data: flat,
        submitted_at:
          appDetails.app_submitted_date_time || r.created_at_tz || null,
        status: appDetails.application_admin_approval || null,
        payment_status: finalFee.payment_status || null,
      };
    });

    return NextResponse.json(out);
  } catch (err: any) {
    console.error("GET /api/applications error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
