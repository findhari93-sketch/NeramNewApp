export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { verifyPaymentTokenServer } from "@/lib/validatePaymentToken";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId: string = body?.razorpay_order_id;
    const paymentId: string = body?.razorpay_payment_id;
    const signature: string = body?.razorpay_signature;
    const token: string | undefined = body?.token;
    const userIdFromClient: string | undefined = body?.userId;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "invalid_payload", hint: "Missing Razorpay fields" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error("[verify] RAZORPAY_KEY_SECRET not configured");
      return NextResponse.json(
        { error: "config_error", hint: "Payment verification not configured" },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("[verify] Signature mismatch");
      return NextResponse.json(
        { error: "invalid_signature", hint: "Payment verification failed" },
        { status: 400 }
      );
    }

    console.log("[verify] Signature verified successfully");

    let applicationId: string | null = null;
    let application: any = null;

    const { data: appsByOrder, error: orderErr } = await supabase
      .from("users_duplicate")
      .select("id, final_fee_payment");

    if (!orderErr && appsByOrder) {
      for (const app of appsByOrder) {
        const finalFee = app.final_fee_payment as any;
        if (finalFee?.razorpay_order_id === orderId) {
          applicationId = app.id;
          application = app;
          console.log("[verify] Found application by order_id", {
            id: applicationId,
          });
          break;
        }
      }
    }

    if (!applicationId && token) {
      const validation = await verifyPaymentTokenServer(token);
      if (validation.ok && validation.payload) {
        applicationId = validation.payload.userId as string;
        console.log("[verify] Extracted userId from JWT", {
          id: applicationId,
        });
      }
    }

    if (!applicationId && userIdFromClient) {
      applicationId = userIdFromClient;
      console.log("[verify] Using userId from client", { id: applicationId });
    }

    if (!applicationId) {
      console.error("[verify] Could not determine application ID");
      return NextResponse.json(
        {
          error: "application_not_found",
          hint: "Could not find application for this payment",
        },
        { status: 404 }
      );
    }

    if (!application) {
      const { data: app, error: fetchErr } = await supabase
        .from("users_duplicate")
        .select("final_fee_payment")
        .eq("id", applicationId)
        .single();

      if (fetchErr || !app) {
        console.error("[verify] Failed to fetch application", fetchErr);
        return NextResponse.json(
          { error: "application_not_found", hint: "Application not found" },
          { status: 404 }
        );
      }
      application = app;
    }

    const finalFee = application.final_fee_payment as any || {};
    const paymentHistory = Array.isArray(finalFee.payment_history)
      ? finalFee.payment_history
      : [];

    const alreadyProcessed = paymentHistory.some(
      (entry: any) => entry.paymentId === paymentId
    );

    if (alreadyProcessed) {
      console.log("[verify] Payment already processed (idempotent)", {
        paymentId,
      });
      const redirectToken = crypto.randomBytes(32).toString("hex");
      return NextResponse.json({
        ok: true,
        redirectToken,
        message: "Payment already verified",
      });
    }

    const now = new Date().toISOString();
    const newPaymentHistory = [
      ...paymentHistory,
      {
        event: "payment.verified",
        paymentId,
        orderId,
        amount: finalFee.payable_amount || 0,
        ts: now,
        source: "verify",
      },
    ];

    const updatedFinalFee = {
      ...finalFee,
      token_used: true,
      payment_status: "paid",
      payment_at: now,
      razorpay_payment_id: paymentId,
      payment_history: newPaymentHistory,
      last_verify_at: now,
    };

    const { error: updateErr } = await supabase
      .from("users_duplicate")
      .update({
        final_fee_payment: updatedFinalFee,
        updated_at: now,
      })
      .eq("id", applicationId);

    if (updateErr) {
      console.error("[verify] Failed to update payment status", updateErr);
      return NextResponse.json(
        { error: "update_failed", hint: "Failed to save payment status" },
        { status: 500 }
      );
    }

    console.log("[verify] Payment verified and saved successfully");

    const redirectToken = crypto.randomBytes(32).toString("hex");

    return NextResponse.json({
      ok: true,
      redirectToken,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("[verify] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "internal_error",
        hint:
          error instanceof Error
            ? error.message
            : "Payment verification failed",
      },
      { status: 500 }
    );
  }
}
