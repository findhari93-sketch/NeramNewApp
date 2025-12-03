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
import { renderInvoicePdf } from "@/lib/invoice";
import {
  sendPaymentConfirmationEmail,
  sendAdminPaymentNotification,
} from "@/lib/email/sendPaymentConfirmationGraph";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function log(msg: string, extra?: any) {
  console.log(`[razorpay:webhook] ${msg}`, extra ?? "");
}

/**
 * Create notification in notifications table
 */
async function createNotification(params: {
  userId: string;
  type:
    | "payment_completed"
    | "payment_failed"
    | "payment_pending"
    | "user_registered";
  title: string;
  message: string;
  data?: any;
  priority?: "low" | "normal" | "high" | "urgent";
}) {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: params.userId,
      notification_type: params.type,
      title: params.title,
      message: params.message,
      data: params.data || {},
      priority: params.priority || "normal",
      is_read: false,
    });

    if (error) {
      log("⚠️ Failed to create notification", { error, userId: params.userId });
    } else {
      log("✅ Notification created", {
        userId: params.userId,
        type: params.type,
      });
    }
  } catch (err) {
    log("❌ Error creating notification", err);
  }
}

/**
 * Get admin user IDs for notifications
 */
async function getAdminUserIds(): Promise<string[]> {
  try {
    // Query users_duplicate for admin users (adjust role field as needed)
    const { data: admins } = await supabase
      .from("users_duplicate")
      .select("id")
      .eq("account->>role", "admin")
      .limit(10);

    if (admins && admins.length > 0) {
      return admins.map((a) => a.id);
    }

    // Fallback: Get first user as admin if no role-based admins found
    const { data: fallbackAdmin } = await supabase
      .from("users_duplicate")
      .select("id")
      .limit(1)
      .single();

    return fallbackAdmin ? [fallbackAdmin.id] : [];
  } catch (err) {
    log("⚠️ Error getting admin users", err);
    return [];
  }
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
      .select(
        "id, final_fee_payment, application_details, basic, contact, account"
      );

    if (!applications || applications.length === 0) {
      log("No applications found in database");
      return NextResponse.json({ ok: true, message: "No applications" });
    }

    let applicationId: string | null = null;
    let application: any = null;

    for (const app of applications) {
      const finalFee = (app.final_fee_payment as any) || {};
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

    // Get current application details and payment info
    const appDetails = (application.application_details as any) || {};
    const finalFee = (application.final_fee_payment as any) || {};
    const accountInfo = (application.account as any) || {};

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

    // Update account type to Premium for successful payments
    const updatedAccount =
      newPaymentStatus === "paid"
        ? { ...accountInfo, account_type: "premium" }
        : accountInfo;

    // Update database - final_fee_payment is a top-level column
    const { error: updateErr } = await supabase
      .from("users_duplicate")
      .update({
        final_fee_payment: updatedFinalFee,
        account: updatedAccount,
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

    // Send email and notifications for successful payments
    if (newPaymentStatus === "paid") {
      log("💰 Payment successful, preparing email notifications...");
      
      // Extract user details from top-level application object
      const basic = (application.basic as any) || {};
      const contact = (application.contact as any) || {};
      const studentName = basic.student_name || basic.name || "Student";
      const userEmail = contact.email || entity.email || "";

      const courseName =
        appDetails.course_name || appDetails.program || "NATA/JEE Coaching";

      log("📧 Email details prepared:", {
        studentName,
        userEmail,
        courseName,
        amount: paymentDetails.amount,
        paymentId,
        orderId,
        paymentDate: paymentDetails.webhook_received_at,
      });

      // Send payment confirmation email with PDF invoice
      if (userEmail) {
        log("📨 Sending user confirmation email to:", userEmail);
        try {
          await sendPaymentConfirmationEmail({
            userEmail,
            studentName,
            courseName,
            amountPaid: paymentDetails.amount || 0,
            paymentId,
            orderId,
            paymentDate: paymentDetails.webhook_received_at,
          });
          log("✅ User confirmation email sent successfully");
        } catch (emailError) {
          log("❌ Failed to send user confirmation email:", emailError);
        }
      } else {
        log("⚠️ No user email found, skipping user confirmation email");
      }

      // Send admin email notification
      log("📨 Sending admin notification emails...");
      try {
        await sendAdminPaymentNotification({
          userEmail,
          studentName,
          courseName,
          amountPaid: paymentDetails.amount || 0,
          paymentId,
          orderId,
          paymentDate: paymentDetails.webhook_received_at,
        });
        log("✅ Admin notification emails sent successfully");
      } catch (adminEmailError) {
        log("❌ Failed to send admin notification:", adminEmailError);
      }

      log("📱 Creating user notification...");
      // Create user notification
      await createNotification({
        userId: applicationId,
        type: "payment_completed",
        title: "Payment Successful",
        message: `Your payment of ₹${paymentDetails.amount?.toLocaleString(
          "en-IN"
        )} has been received successfully. Invoice sent to your email.`,
        data: {
          payment_id: paymentId,
          order_id: orderId,
          amount: paymentDetails.amount,
          method: entity.method,
          payment_date: paymentDetails.webhook_received_at,
        },
        priority: "high",
      });

      // Send admin email notification
      await sendAdminPaymentNotification({
        userEmail,
        studentName,
        courseName,
        amountPaid: paymentDetails.amount || 0,
        paymentId,
        orderId,
        paymentDate: paymentDetails.webhook_received_at,
      });

      // Create admin notifications (in-app)
      const adminIds = await getAdminUserIds();
      for (const adminId of adminIds) {
        await createNotification({
          userId: adminId,
          type: "payment_completed",
          title: "New Payment Received",
          message: `${studentName} completed payment of ₹${paymentDetails.amount?.toLocaleString(
            "en-IN"
          )} via ${entity.method || "online"}.`,
          data: {
            student_name: studentName,
            student_email: userEmail,
            application_id: applicationId,
            payment_id: paymentId,
            order_id: orderId,
            amount: paymentDetails.amount,
            method: entity.method,
            payment_date: paymentDetails.webhook_received_at,
          },
          priority: "high",
        });
      }

      log("✅ Email and notifications sent for successful payment");
    }

    // Create notifications for failed payments
    if (newPaymentStatus === "failed") {
      await createNotification({
        userId: applicationId,
        type: "payment_failed",
        title: "Payment Failed",
        message: `Your payment attempt failed. ${
          entity.error_description || "Please try again."
        }`,
        data: {
          payment_id: paymentId,
          order_id: orderId,
          amount: paymentDetails.amount,
          error_code: entity.error_code,
          error_description: entity.error_description,
        },
        priority: "high",
      });

      log("✅ Notification created for failed payment");
    }

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
