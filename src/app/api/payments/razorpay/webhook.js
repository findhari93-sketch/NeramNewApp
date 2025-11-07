// /api/razorpay/webhook.js
// Vercel serverless function to handle Razorpay webhooks securely.

import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false, // we need raw body for signature verification
  },
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  try {
    // Read raw body
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks);
    const signature = req.headers["x-razorpay-signature"];

    // Verify signature
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expected !== signature) {
      console.warn("⚠️ Invalid Razorpay webhook signature");
      return res.status(400).send("Invalid signature");
    }

    const payload = JSON.parse(rawBody.toString());
    const event = payload.event || "unknown";
    console.log("📬 Razorpay webhook received:", event);

    // Find application ID from notes
    let applicationId =
      payload?.payload?.payment_link?.entity?.notes?.application_id ||
      payload?.payload?.payment?.entity?.notes?.application_id ||
      null;

    // Fallback: look up by payment_link_id if needed
    if (!applicationId && payload?.payload?.payment_link?.entity?.id) {
      const linkId = payload.payload.payment_link.entity.id;
      const { data } = await supabase
        .from("users_duplicate")
        .select("id")
        .eq("payment_link_id", linkId)
        .single();
      if (data?.id) applicationId = data.id;
    }

    if (!applicationId) {
      console.warn("No application ID found in webhook payload");
      return res.status(200).send("ok");
    }

    // Get application data
    const { data: app } = await supabase
      .from("users_duplicate")
      .select("*")
      .eq("id", applicationId)
      .single();

    // Extract payment details
    const payment =
      payload?.payload?.payment?.entity ||
      payload?.payload?.payment_link?.entity?.payment ||
      null;

    const paymentEntry = {
      event,
      payment_id: payment?.id || null,
      amount: payment ? payment.amount / 100 : null,
      method: payment?.method || null,
      status: payment?.status || null,
      created_at: new Date().toISOString(),
    };

    // Update payment status
    let newStatus = app?.payment_status || "pending";
    if (event === "payment_link.paid" || event === "payment.captured") {
      if (app?.payment_choice === "partial") newStatus = "partial";
      else newStatus = "paid";
    } else if (event === "payment.failed" || event === "payment_link.failed") {
      newStatus = "failed";
    }

    // Append to payment history
    const existingHistory = Array.isArray(app?.payment_history)
      ? app.payment_history
      : [];
    existingHistory.push(paymentEntry);

    await supabase
      .from("users_duplicate")
      .update({
        payment_status: newStatus,
        payment_at: new Date().toISOString(),
        payment_method: payment?.method || app?.payment_method || null,
        payment_history: existingHistory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    console.log(`✅ Updated application ${applicationId}: ${newStatus}`);
    res.status(200).send("ok");
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(500).send("Server error");
  }
}
