export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import admin from "firebase-admin";
import supabaseServer from "../../../../../lib/supabaseServer";

// Initialize firebase-admin if needed
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

export async function POST(req: Request) {
  try {
    const allowUnauth = process.env.ALLOW_UNAUTH_RAZORPAY === "true";
    // Auth
    let uid: string | null = null;
    if (!allowUnauth) {
      const authHeader = req.headers.get("authorization") || "";
      const idToken = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : "";
      if (!idToken) {
        return NextResponse.json(
          { error: "invalid_token", hint: "Missing Authorization header" },
          { status: 401 }
        );
      }
      try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        uid = decoded.uid;
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
    const orderId: string = body?.razorpay_order_id;
    const paymentId: string = body?.razorpay_payment_id;
    const signature: string = body?.razorpay_signature;
    const amount: number | undefined = body?.amount; // optional, in INR
    const course: string | undefined = body?.course; // optional course slug/id
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "invalid_payload", hint: "Missing Razorpay fields" },
        { status: 400 }
      );
    }

    const secret =
      process.env.RAZORPAY_KEY_SECRET || process.env.NEXT_RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "server_misconfigured", hint: "Missing Razorpay secret" },
        { status: 500 }
      );
    }

    // Verify signature
    const payload = `${orderId}|${paymentId}`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    const verified = expected === signature;
    if (!verified) {
      return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
    }

    // Persist to Supabase users table (merge into application JSON)
    // We associate by firebase_uid. If unauth dev mode, we skip DB write.
    if (uid) {
      const { data: userRow } = await supabaseServer
        .from("users")
        .select("id, application, account_type")
        .eq("firebase_uid", uid)
        .maybeSingle();

      const currentApp = (userRow?.application as any) || {};
      const payments = Array.isArray(currentApp.payments)
        ? currentApp.payments
        : [];

      // Idempotency: if this paymentId already exists, don't duplicate side effects
      const already = payments.some((p: any) => p && p.paymentId === paymentId);

      if (!already)
        payments.push({
          provider: "razorpay",
          orderId,
          paymentId,
          signature,
          amount: typeof amount === "number" ? amount : undefined,
          currency: body?.currency || "INR",
          status: "verified",
          course: course || undefined,
          ts: new Date().toISOString(),
        });

      // Add simple entitlement/purchase record
      const purchases = Array.isArray((currentApp as any).purchases)
        ? (currentApp as any).purchases
        : [];
      if (!already) {
        purchases.push({
          course: course || "general",
          paymentId,
          orderId,
          amount: typeof amount === "number" ? amount : undefined,
          granted_at: new Date().toISOString(),
          provider: "razorpay",
        });
      }

      // Elevate account_type to 'premium' but avoid overriding if present
      const accountTypeUpdate = already ? undefined : ("premium" as any);

      // Minimal invoice record (placeholder for future PDF/email integration)
      const invoices = Array.isArray((currentApp as any).invoices)
        ? (currentApp as any).invoices
        : [];
      const hasInvoice = invoices.some(
        (inv: any) => inv && inv.paymentId === paymentId
      );
      if (!already && !hasInvoice) {
        invoices.push({
          paymentId,
          orderId,
          amount: typeof amount === "number" ? amount : undefined,
          currency: body?.currency || "INR",
          course: course || undefined,
          created_at: new Date().toISOString(),
          // In future: url to uploaded PDF, tax details, etc.
        });
      }

      const newApp = { ...currentApp, payments, purchases, invoices };
      const updatePayload: Record<string, any> = { application: newApp };
      if (accountTypeUpdate) updatePayload["account_type"] = accountTypeUpdate;

      const { error } = await supabaseServer
        .from("users")
        .update(updatePayload)
        .eq("firebase_uid", uid);
      if (error) {
        // Fallback if account_type column doesn't exist: drop it and retry
        const msg = String(error.message || "").toLowerCase();
        if (msg.includes("column") && msg.includes("account_type")) {
          try {
            const fallbackPayload = { application: newApp } as any;
            await supabaseServer
              .from("users")
              .update(fallbackPayload)
              .eq("firebase_uid", uid);
          } catch (e) {
            // If fallback also fails, let the outer try/catch handle
            throw e;
          }
        } else {
          throw error;
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("razorpay verify error:", err);
    return NextResponse.json(
      { error: "verify_failed", hint: err?.message || String(err) },
      { status: 500 }
    );
  }
}
