export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import admin from "firebase-admin";
import { createClient } from "@supabase/supabase-js";
import { verifyPaymentTokenServer } from "@/lib/validatePaymentToken";

// --- Firebase init (safe to run multiple times)
if (!admin.apps.length) {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(json)),
      });
    } catch (e) {
      console.warn("FIREBASE_SERVICE_ACCOUNT_JSON parse error:", e);
    }
  } else if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(
          /\\n/g,
          "\n"
        ),
      }),
    });
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function dev(msg: string, extra?: any) {
  console.log("[razorpay:create-order]", msg, extra ?? "");
}

export async function POST(req: Request) {
  try {
    const allowUnauth = process.env.ALLOW_UNAUTH_RAZORPAY === "true";
    const body = await req.json().catch(() => ({}));

    // ---- Three flows:
    // 1. JWT token (from admin email link with 'jwtToken')
    // 2. DB token (from /pay?token=XXX)
    // 3. Direct with amount (authenticated with Firebase)
    const token: string | undefined = body?.token;
    let applicationId: string | null = null;
    let rupees: number;

    // Priority 1: Try to treat provided token as JWT (server-verified)
    if (token) {
      const validation = await verifyPaymentTokenServer(token);
      if (validation.ok) {
        dev("JWT token flow", { token: token.substring(0, 30) + "..." });
        const payload = validation.payload! as any;
        applicationId = payload.userId;
        rupees = Number(payload.amount);

        // Optional: Check already-paid state
        const { data: application } = await supabase
          .from("users_duplicate")
          .select("final_fee_payment")
          .eq("id", applicationId)
          .single();
        if (application) {
          const finalFee = application.final_fee_payment as any || {};
          if (finalFee.payment_status === "paid") {
            return NextResponse.json(
              { error: "already_paid", hint: "Payment already completed" },
              { status: 400 }
            );
          }
        }

        if (!Number.isFinite(rupees) || rupees <= 0) {
          return NextResponse.json(
            { error: "invalid_amount", hint: "Invalid amount in token" },
            { status: 400 }
          );
        }
      } else {
        // Not a valid JWT – fall back to legacy DB token flow
        dev("DB token flow", { token: token.substring(0, 20) + "..." });

        const { data: applications, error: lookupErr } = await supabase
          .from("users_duplicate")
          .select("id, final_fee_payment")
          .not("final_fee_payment", "is", null);

        if (lookupErr) {
          console.error("DB lookup error:", lookupErr);
          return NextResponse.json(
            { error: "db_error", hint: "Failed to lookup application" },
            { status: 500 }
          );
        }

        // Find application with matching token
        let matchedApp: any = null;
        for (const app of applications || []) {
          const finalFee = app.final_fee_payment as any || {};
          if (finalFee.token === token) {
            matchedApp = app;
            break;
          }
        }

        if (!matchedApp) {
          dev("Token not found in any application");
          return NextResponse.json(
            { error: "invalid_token", hint: "Payment token not found" },
            { status: 400 }
          );
        }

        applicationId = matchedApp.id;
        const finalFee = matchedApp.final_fee_payment as any || {};

        // Check 1: token_expires > now
        if (finalFee.token_expires) {
          const expiresAt = new Date(finalFee.token_expires).getTime();
          if (Date.now() > expiresAt) {
            dev("Token expired", { expiresAt, now: Date.now() });
            return NextResponse.json(
              {
                error: "token_expired",
                hint: "Payment link has expired. Please request a new one.",
              },
              { status: 400 }
            );
          }
        }

        // Check 2: token_used !== true
        if (finalFee.token_used === true) {
          dev("Token already used");
          return NextResponse.json(
            {
              error: "token_used",
              hint: "This payment link has already been used.",
            },
            { status: 400 }
          );
        }

        // Check 3: payment_status !== 'paid'
        if (finalFee.payment_status === "paid") {
          dev("Payment already completed");
          return NextResponse.json(
            {
              error: "already_paid",
              hint: "Payment has already been completed for this application.",
            },
            { status: 400 }
          );
        }

        // Use payable_amount from DB
        rupees = Number(finalFee.payable_amount || 0);
        if (!Number.isFinite(rupees) || rupees <= 0) {
          dev("Invalid payable_amount", {
            payable_amount: finalFee.payable_amount,
          });
          return NextResponse.json(
            {
              error: "invalid_amount",
              hint: "Application has no valid payable amount",
            },
            { status: 400 }
          );
        }

        dev("Token validation passed", {
          applicationId,
          rupees,
          payment_status: finalFee.payment_status,
        });
      }
    } else {
      // Flow 2: Direct payment with auth (existing flow for backward compatibility)
      if (!allowUnauth) {
        const authHeader = req.headers.get("authorization") || "";
        const idToken = authHeader.startsWith("Bearer ")
          ? authHeader.split(" ")[1]
          : "";
        if (!idToken) {
          return NextResponse.json(
            {
              error: "invalid_token",
              hint: "Missing Authorization: Bearer <idToken>",
            },
            { status: 401 }
          );
        }
        try {
          await admin.auth().verifyIdToken(idToken);
        } catch (e: any) {
          return NextResponse.json(
            {
              error: "invalid_token",
              hint: e?.message || "verifyIdToken failed",
            },
            { status: 401 }
          );
        }
      }

      rupees = Number(body?.amount ?? 0);
      if (!Number.isFinite(rupees) || rupees <= 0) {
        return NextResponse.json(
          { error: "invalid_amount", hint: "amount must be > 0 (rupees)" },
          { status: 400 }
        );
      }
    }
    const amount = Math.round(rupees * 100);

    const key_id =
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      "";
    const key_secret =
      process.env.RAZORPAY_KEY_SECRET ||
      process.env.NEXT_RAZORPAY_KEY_SECRET ||
      "";

    // Log presence booleans (not values)
    dev("env check", {
      has_key_id: Boolean(key_id),
      has_key_secret: Boolean(key_secret),
    });

    if (!key_id || !key_secret) {
      return NextResponse.json(
        {
          error: "server_misconfigured",
          hint: "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local and restart",
        },
        { status: 500 }
      );
    }

    const rz = new Razorpay({ key_id, key_secret });
    const order = await rz.orders.create({
      amount,
      currency: (body?.currency as string) || "INR",
      receipt: body?.receipt || `rcpt_${Date.now()}`,
      notes: body?.notes || {
        app: "neram",
        applicationId: applicationId || undefined,
      },
    });

    // Save razorpay_order_id to application so webhook can map order → application
    if (applicationId && token) {
      const { data: existingApp } = await supabase
        .from("users_duplicate")
        .select("final_fee_payment")
        .eq("id", applicationId)
        .single();

      if (existingApp) {
        const finalFee = (existingApp.final_fee_payment as any) || {};

        const updatedFinalFee = {
          ...finalFee,
          razorpay_order_id: order.id,
          order_created_at: new Date().toISOString(),
        };

        await supabase
          .from("users_duplicate")
          .update({ final_fee_payment: updatedFinalFee })
          .eq("id", applicationId);

        dev("Saved razorpay_order_id to application", { order_id: order.id });
      }
    }

    return NextResponse.json(
      {
        keyId: key_id, // needed by client to open Razorpay checkout
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("razorpay create-order error:", err);
    return NextResponse.json(
      { error: "order_create_failed", hint: err?.message || String(err) },
      { status: 500 }
    );
  }
}

// Small helper to expose the public key to the client (optional)
export async function GET() {
  return NextResponse.json({
    keyId:
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      null,
  });
}
