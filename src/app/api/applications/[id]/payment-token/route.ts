import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * POST /api/applications/[id]/payment-token
 * Issues a signed JWT payment token (same format as email link) if:
 *  - user is authenticated and is owner OR an admin
 *  - application is approved
 *  - application not already marked paid
 * Response: { token, payUrl }
 */
export async function POST(req: NextRequest, { params }: { params: any }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const secret = process.env.PAYMENT_TOKEN_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "server_misconfigured", hint: "PAYMENT_TOKEN_SECRET not set" },
      { status: 500 }
    );
  }

  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isAdmin =
    user.user_metadata?.role === "admin" ||
    (user.email && ADMIN_EMAILS.includes(user.email));

  const { data: row, error: fetchErr } = await supabase
    .from("users_duplicate")
    .select("id, account, application_details, final_fee_payment, admin_filled")
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

  const account = (row as any).account || {};
  const ownerFirebaseUid = account.firebase_uid || account.firebaseUid || null;
  const isOwner = ownerFirebaseUid && ownerFirebaseUid === user.id;

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const appDetails = (row as any).application_details || {};
  const finalFee = (row as any).final_fee_payment || {};
  const adminFilled = (row as any).admin_filled || {};

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

  if ((finalFee.payment_status || "").toLowerCase() === "paid") {
    return NextResponse.json({ error: "already_paid" }, { status: 400 });
  }

  // Amount resolution priority: admin_filled.amount | admin_filled.final_amount | admin_filled.payable_amount | final_fee_payment.payable_amount
  const rupees = Number(
    adminFilled.amount ||
      adminFilled.final_amount ||
      adminFilled.payable_amount ||
      finalFee.payable_amount ||
      0
  );

  if (!Number.isFinite(rupees) || rupees <= 0) {
    return NextResponse.json(
      { error: "invalid_amount", hint: "No valid payable amount configured." },
      { status: 400 }
    );
  }

  // Sign JWT
  const { default: jwt } = await import("jsonwebtoken");
  const payload = { userId: id, amount: rupees, type: "full" } as const;
  const token = jwt.sign(payload, secret, { expiresIn: "7d" });

  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const base =
    site ||
    (typeof req.headers.get === "function" ? req.headers.get("host") : "");
  const origin = site || (base ? `https://${base}` : "");
  const payUrl = `${origin.replace(/\/$/, "")}/pay?v=${token}&type=razorpay`;

  return NextResponse.json({ token, payUrl, amount: rupees });
}
