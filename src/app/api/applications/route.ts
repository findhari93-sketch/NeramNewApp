import { NextResponse } from "next/server";
import supabaseServer from "../../../lib/supabaseServer";
import {
  mapFromUsersDuplicate,
  type UsersDuplicateRow,
} from "../../../lib/userFieldMapping";

/**
 * GET /api/applications
 * Returns a list of submitted applications for the frontend list page.
 * Response: [{ id, data, submitted_at, status, payment_status }, ...]
 */
export async function GET() {
  try {
    // Query rows where application_details.application_submitted = true
    const { data, error } = await supabaseServer
      .from("users_duplicate")
      .select("*")
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
