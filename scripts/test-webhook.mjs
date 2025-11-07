/**
 * Test script for Razorpay webhook
 *
 * Usage:
 *   node scripts/test-webhook.mjs
 *
 * This sends a mock webhook to your local server to test signature verification
 * and payment processing.
 */

import crypto from "crypto";
import https from "https";

const WEBHOOK_SECRET =
  process.env.RAZORPAY_WEBHOOK_SECRET || "neram_webhook_secret_2025";
const WEBHOOK_URL =
  process.env.WEBHOOK_URL ||
  "http://localhost:3001/api/payments/razorpay/webhook";

// Test payment captured event
const testPayload = {
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        id: "pay_test_" + Date.now(),
        order_id: "order_LbYcX3GzvTz9Ue", // Replace with actual order_id from your DB
        amount: 250000, // 2500.00 INR in paise
        currency: "INR",
        status: "captured",
        method: "upi",
        vpa: "student@paytm",
        email: "student@example.com",
        contact: "+916380194614",
        fee: 5900, // 59 INR
        tax: 900, // 9 INR
        captured: true,
        international: false,
        created_at: Math.floor(Date.now() / 1000),
        notes: {
          app: "neram",
          batch: "Crash 2026",
          course: "NATA/JEE2 Crash Course",
        },
      },
    },
  },
};

// Test payment failed event
const testFailedPayload = {
  event: "payment.failed",
  payload: {
    payment: {
      entity: {
        id: "pay_failed_" + Date.now(),
        order_id: "order_LbYcX3GzvTz9Ue",
        amount: 250000,
        currency: "INR",
        status: "failed",
        method: "upi",
        error_code: "BAD_REQUEST_ERROR",
        error_description: "Payment failed due to insufficient balance",
        error_source: "customer",
        error_step: "payment_authentication",
        error_reason: "payment_declined",
        created_at: Math.floor(Date.now() / 1000),
      },
    },
  },
};

function generateSignature(payload, secret) {
  const payloadString = JSON.stringify(payload);
  return crypto
    .createHmac("sha256", secret)
    .update(payloadString)
    .digest("hex");
}

async function sendWebhook(payload, description) {
  const payloadString = JSON.stringify(payload);
  const signature = generateSignature(payload, WEBHOOK_SECRET);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing: ${description}`);
  console.log(`${"=".repeat(60)}`);
  console.log(`Event: ${payload.event}`);
  console.log(`Payment ID: ${payload.payload.payment.entity.id}`);
  console.log(`Order ID: ${payload.payload.payment.entity.order_id}`);
  console.log(`Signature: ${signature.substring(0, 20)}...`);
  console.log(`\nSending to: ${WEBHOOK_URL}\n`);

  try {
    const url = new URL(WEBHOOK_URL);
    const isHttps = url.protocol === "https:";
    const httpModule = isHttps ? https : (await import("http")).default;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payloadString),
        "x-razorpay-signature": signature,
        "User-Agent": "Razorpay-Webhook-Test/1.0",
      },
    };

    return new Promise((resolve, reject) => {
      const req = httpModule.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          console.log(`Status: ${res.statusCode} ${res.statusMessage}`);

          try {
            const response = JSON.parse(data);
            console.log("Response:", JSON.stringify(response, null, 2));

            if (res.statusCode === 200) {
              console.log("✅ Webhook processed successfully");
            } else {
              console.log("⚠️ Webhook returned non-200 status");
            }
          } catch {
            console.log("Response (raw):", data);
          }

          resolve();
        });
      });

      req.on("error", (error) => {
        console.error("❌ Request failed:", error.message);
        reject(error);
      });

      req.write(payloadString);
      req.end();
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function main() {
  console.log("\n🔧 Razorpay Webhook Test Script");
  console.log("================================\n");
  console.log(`Webhook URL: ${WEBHOOK_URL}`);
  console.log(`Secret configured: ${WEBHOOK_SECRET ? "✅" : "❌"}`);

  if (!WEBHOOK_SECRET) {
    console.error("\n❌ RAZORPAY_WEBHOOK_SECRET not set!");
    console.log("Set it in .env.local or run:");
    console.log(
      "  RAZORPAY_WEBHOOK_SECRET=your_secret node scripts/test-webhook.mjs"
    );
    process.exit(1);
  }

  console.log("\n⚠️  IMPORTANT: Make sure you have:");
  console.log("  1. Started your dev server (npm run dev)");
  console.log(
    "  2. Created a payment order with order_id: order_LbYcX3GzvTz9Ue"
  );
  console.log("     (or update the order_id in this script)");
  console.log("\n");

  // Test 1: Successful payment
  await sendWebhook(testPayload, "Payment Captured (Success)");

  // Wait 1 second
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 2: Failed payment
  await sendWebhook(testFailedPayload, "Payment Failed");

  // Wait 1 second
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 3: Duplicate webhook (idempotency test)
  await sendWebhook(testPayload, "Duplicate Webhook (Idempotency Check)");

  console.log("\n" + "=".repeat(60));
  console.log("Tests completed!");
  console.log("=".repeat(60));
  console.log("\nCheck your server logs and database to verify:");
  console.log("  - Signature verification passed");
  console.log("  - Application found by order_id");
  console.log("  - payment_status updated");
  console.log("  - payment_history contains entries");
  console.log("  - Duplicate webhook was rejected (idempotent)");
  console.log("\n");
}

main().catch(console.error);
