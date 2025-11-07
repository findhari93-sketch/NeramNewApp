/**
 * Razorpay Webhook Handler (App Router)
 * Verifies webhook signatures and stores comprehensive payment details
 *
 * Events handled:
 * - payment.captured: Payment successful and captured
 * - payment.failed: Payment failed
 * - order.paid: Order fully paid
 * - payment.authorized: Payment authorized (needs capture)
 * - payment.refunded: Refund processed
 *
 * IMPORTANT:
 * - Signature verification is mandatory for security
 * - Raw body is needed for signature verification
 * - Must be idempotent (handle duplicate webhooks gracefully)
 * - This is the source of truth for payment confirmation
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function log(msg: string, extra?: any) {
  console.log(`[razorpay:webhook] ${msg}`, extra ?? "");
}

export async function POST(req: Request) {
  try {
    // Read raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      log("⚠️ Missing signature header");
      return NextResponse.json({ error: "missing_signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      log("❌ RAZORPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "webhook_not_configured" },
        { status: 500 }
      );
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      log("⚠️ Invalid signature");
      return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
    }

    log("✅ Signature verified");

    // Parse payload after verification
    const payload = JSON.parse(rawBody);
    const event = payload.event as string;

    // Extract entity from different webhook structures
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderEntity = payload?.payload?.order?.entity;
    const entity = paymentEntity || orderEntity || {};

    log(`📬 Event: ${event}`, {
      payment_id: entity.id,
      order_id: entity.order_id,
      status: entity.status,
      amount: entity.amount,
    });

    // Extract order_id - this is our key to finding the application
    const orderId = entity.order_id || entity.id;
    const paymentId = entity.id;

    if (!orderId) {
      log("⚠️ No order_id in webhook payload");
      return NextResponse.json({ error: "missing_order_id" }, { status: 400 });
    }

    // Find application by razorpay_order_id in users_duplicate table
    const { data: applications } = await supabase
      .from("users_duplicate")
      .select("id, application_details");

    if (!applications || applications.length === 0) {
      log("No applications found in database");
      return NextResponse.json({ ok: true, message: "No applications" });
    }

    let applicationId: string | null = null;
    let application: any = null;

    for (const app of applications) {
      const appDetails = app.application_details as any;
      const finalFee = appDetails?.final_fee_payment || {};
      if (finalFee.razorpay_order_id === orderId) {
        applicationId = app.id;
        application = app;
        log("✅ Found application", { id: applicationId, order_id: orderId });
        break;
      }
    }

    if (!applicationId || !application) {
      log("⚠️ Application not found for order", { order_id: orderId });
      // Return 200 to acknowledge receipt (don't retry)
      return NextResponse.json({ ok: true, message: "Application not found" });
    }

    // Get current application details
    const appDetails = (application.application_details as any) || {};
    const finalFee = appDetails.final_fee_payment || {};

    // Check idempotency: if this webhook event was already processed
    const paymentHistory = Array.isArray(finalFee.payment_history)
      ? finalFee.payment_history
      : [];

    const alreadyProcessed = paymentHistory.some(
      (entry: any) =>
        (entry.payment_id === paymentId && entry.event === event) ||
        entry.webhook_id === paymentId
    );

    if (alreadyProcessed) {
      log("⚠️ Webhook already processed (idempotent)", {
        payment_id: paymentId,
        event,
      });
      return NextResponse.json({
        ok: true,
        message: "Already processed",
      });
    }

    // Extract comprehensive payment details from webhook
    const paymentDetails = {
      event,
      webhook_id: paymentId,
      payment_id: paymentId,
      order_id: orderId,
      amount: entity.amount ? entity.amount / 100 : null, // Convert paise to rupees
      amount_paid: entity.amount_paid ? entity.amount_paid / 100 : null,
      amount_due: entity.amount_due ? entity.amount_due / 100 : null,
      currency: entity.currency || "INR",
      status: entity.status,
      method: entity.method, // card, upi, netbanking, wallet, etc.
      bank: entity.bank || null,
      wallet: entity.wallet || null,
      vpa: entity.vpa || null, // UPI VPA
      email: entity.email || null,
      contact: entity.contact || null,
      fee: entity.fee ? entity.fee / 100 : null,
      tax: entity.tax ? entity.tax / 100 : null,
      error_code: entity.error_code || null,
      error_description: entity.error_description || null,
      error_source: entity.error_source || null,
      error_step: entity.error_step || null,
      error_reason: entity.error_reason || null,
      international: entity.international || false,
      captured: entity.captured || false,
      description: entity.description || null,
      card_id: entity.card_id || null,
      acquirer_data: entity.acquirer_data || null,
      created_at: entity.created_at
        ? new Date(entity.created_at * 1000).toISOString()
        : new Date().toISOString(),
      webhook_received_at: new Date().toISOString(),
      notes: entity.notes || {},
    };

    // Determine new payment status based on event
    let newPaymentStatus = finalFee.payment_status || "pending";

    if (
      event === "payment.captured" ||
      event === "order.paid" ||
      entity.status === "captured"
    ) {
      newPaymentStatus = "paid";
    } else if (event === "payment.failed" || entity.status === "failed") {
      newPaymentStatus = "failed";
    } else if (
      event === "payment.authorized" ||
      entity.status === "authorized"
    ) {
      newPaymentStatus = "authorized";
    } else if (event === "payment.refunded") {
      newPaymentStatus = "refunded";
    }

    // Append to payment history
    const updatedPaymentHistory = [...paymentHistory, paymentDetails];

    // Update final_fee_payment with comprehensive details
    const updatedFinalFee = {
      ...finalFee,
      payment_status: newPaymentStatus,
      razorpay_payment_id: paymentId || finalFee.razorpay_payment_id,
      payment_method: entity.method || finalFee.payment_method,
      payment_at:
        newPaymentStatus === "paid"
          ? new Date().toISOString()
          : finalFee.payment_at,
      payment_history: updatedPaymentHistory,
      last_webhook_at: new Date().toISOString(),
      last_webhook_event: event,
      // Store additional payment details for reference
      bank: entity.bank || finalFee.bank,
      wallet: entity.wallet || finalFee.wallet,
      upi_vpa: entity.vpa || finalFee.upi_vpa,
      captured: entity.captured ?? finalFee.captured,
      international: entity.international ?? finalFee.international,
      // Store error details if payment failed
      ...(newPaymentStatus === "failed" && {
        error_code: entity.error_code,
        error_description: entity.error_description,
        error_reason: entity.error_reason,
      }),
    };

    const updatedAppDetails = {
      ...appDetails,
      final_fee_payment: updatedFinalFee,
    };

    // Update database
    const { error: updateErr } = await supabase
      .from("users_duplicate")
      .update({
        application_details: updatedAppDetails,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateErr) {
      log("❌ Failed to update database", updateErr);
      return NextResponse.json(
        { error: "update_failed", details: updateErr.message },
        { status: 500 }
      );
    }

    log(`✅ Payment status updated to: ${newPaymentStatus}`, {
      application_id: applicationId,
      payment_id: paymentId,
      event,
      status: entity.status,
      amount: paymentDetails.amount,
      method: entity.method,
    });

    return NextResponse.json({
      ok: true,
      message: "Webhook processed successfully",
      application_id: applicationId,
      payment_status: newPaymentStatus,
    });
  } catch (err) {
    log("❌ Webhook error:", err);
    return NextResponse.json(
      {
        error: "internal_error",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

// Reject non-POST requests
export async function GET() {
  return NextResponse.json(
    { error: "method_not_allowed", message: "Use POST for webhooks" },
    { status: 405 }
  );
}
