import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/applications/[id]/payment-token
 * Retrieves the admin-generated JWT payment token from database.
 * This token was created when admin approved the application.
 * No authentication required - token itself is the security mechanism.
 * Response: { token, payUrl, amount }
 */
export async function GET(req: NextRequest, { params }: { params: any }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: row, error: fetchErr } = await supabase
    .from("users_duplicate")
    .select("id, application_details, final_fee_payment, admin_filled")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) {
    return NextResponse.json(
      { error: "db_error", hint: fetchErr.message },
      { status: 500 }
    );
  }
  if (!row) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const appDetails = (row as any).application_details || {};
  const finalFee = (row as any).final_fee_payment || {};
  const adminFilled = (row as any).admin_filled || {};

  // Debug logging to help locate token
  console.log("[payment-token] Debug info:", {
    id,
    hasAppDetails: !!appDetails,
    hasPaymentMetadata: !!appDetails.payment_metadata,
    hasFinalFee: !!finalFee,
    hasAdminFilled: !!adminFilled,
    paymentMetadataKeys: appDetails.payment_metadata
      ? Object.keys(appDetails.payment_metadata)
      : [],
    finalFeeKeys: Object.keys(finalFee),
    adminFilledKeys: Object.keys(adminFilled),
  });

  // Check approval status
  const status = (appDetails.application_admin_approval || "").toLowerCase();
  if (!status.includes("approve")) {
    return NextResponse.json(
      {
        error: "not_approved",
        hint: "Application must be approved before payment.",
      },
      { status: 400 }
    );
  }

  // Check if already paid
  if ((finalFee.payment_status || "").toLowerCase() === "paid") {
    return NextResponse.json({ error: "already_paid" }, { status: 400 });
  }

  // Look for admin-generated JWT token in multiple possible locations
  let token: string | null = null;

  // Priority 1: application_details.payment_metadata.token (admin app generates here)
  if (appDetails.payment_metadata?.token) {
    token = appDetails.payment_metadata.token;
    console.log("[payment-token] Found token in payment_metadata.token");
  }

  // Priority 2: final_fee_payment.token (legacy location)
  if (!token && finalFee.token) {
    token = finalFee.token;
    console.log("[payment-token] Found token in final_fee_payment.token");
  }

  // Priority 3: admin_filled.payment_token (alternative location)
  if (!token && adminFilled.payment_token) {
    token = adminFilled.payment_token;
    console.log("[payment-token] Found token in admin_filled.payment_token");
  }

  // Priority 4: Check if it's stored directly in application_details
  if (!token && (appDetails as any).token) {
    token = (appDetails as any).token;
    console.log("[payment-token] Found token in application_details.token");
  }

  // If no token exists, generate one on-demand (fallback for old approvals)
  if (!token) {
    console.log(
      "[payment-token] No existing token found, generating new one..."
    );

    const secret = process.env.PAYMENT_TOKEN_SECRET;
    if (!secret) {
      console.error("[payment-token] PAYMENT_TOKEN_SECRET not configured");
      return NextResponse.json(
        {
          error: "server_misconfigured",
          hint: "Payment system not configured. Contact admin.",
        },
        { status: 500 }
      );
    }

    // Get amount from admin_filled
    const rupees = Number(
      adminFilled.final_fee_payment_amount ||
        adminFilled.amount ||
        adminFilled.final_amount ||
        adminFilled.payable_amount ||
        finalFee.payable_amount ||
        adminFilled.total_course_fees ||
        0
    );

    if (!Number.isFinite(rupees) || rupees <= 0) {
      console.error("[payment-token] No valid amount found:", {
        adminFilled,
        finalFee,
      });
      return NextResponse.json(
        {
          error: "invalid_amount",
          hint: "No valid payable amount configured. Contact admin.",
        },
        { status: 400 }
      );
    }

    // Generate JWT token
    const { default: jwt } = await import("jsonwebtoken");
    const payload = { userId: id, amount: rupees, type: "full" };
    token = jwt.sign(payload, secret, { expiresIn: "7d" });

    // Store token in database for future use
    const now = new Date().toISOString();
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const updatedFinalFee = {
      ...finalFee,
      token,
      token_expires: expiresAt,
      token_generated_at: now,
      payable_amount: rupees,
    };

    await supabase
      .from("users_duplicate")
      .update({ final_fee_payment: updatedFinalFee })
      .eq("id", id);

    console.log("[payment-token] Generated and stored new token");
  } // Get amount (use same amount that was used for token generation)
  const rupees = Number(
    adminFilled.final_fee_payment_amount ||
      adminFilled.amount ||
      adminFilled.final_amount ||
      adminFilled.payable_amount ||
      finalFee.payable_amount ||
      adminFilled.total_course_fees ||
      appDetails.payment_metadata?.payable_amount ||
      0
  );

  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const origin = site || `https://${req.headers.get("host") || ""}`;
  const payUrl = `${origin.replace(/\/$/, "")}/pay?v=${token}&type=razorpay`;

  console.log("[payment-token] Returning payment URL:", {
    amount: rupees,
    hasToken: !!token,
  });
  return NextResponse.json({ token, payUrl, amount: rupees });
}
