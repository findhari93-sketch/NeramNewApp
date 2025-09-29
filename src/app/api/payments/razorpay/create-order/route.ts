export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import admin from "firebase-admin";

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

function dev(msg: string, extra?: any) {
  console.log("[razorpay:create-order]", msg, extra ?? "");
}

export async function POST(req: Request) {
  try {
    const allowUnauth = process.env.ALLOW_UNAUTH_RAZORPAY === "true";

    // ---- Auth (skip in dev if ALLOW_UNAUTH_RAZORPAY=true)
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

    const body = await req.json().catch(() => ({}));
    const rupees = Number(body?.amount ?? 0);
    if (!Number.isFinite(rupees) || rupees <= 0) {
      return NextResponse.json(
        { error: "invalid_amount", hint: "amount must be > 0 (rupees)" },
        { status: 400 }
      );
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
      notes: body?.notes || { app: "neram" },
    });

    return NextResponse.json(
      {
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
