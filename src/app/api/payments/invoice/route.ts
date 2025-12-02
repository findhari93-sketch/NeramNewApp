export const runtime = "nodejs";

import { NextResponse } from "next/server";
import admin from "firebase-admin";
import supabaseServer from "../../../../lib/supabaseServer";
import { renderInvoiceHtml, renderInvoicePdf } from "../../../../lib/invoice";
import { sendMail } from "../../../../lib/email";

// Initialize Firebase Admin if needed
if (!admin.apps.length) {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(json)),
      });
    } catch {}
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

/**
 * GET /api/payments/invoice
 * Download the latest invoice for the authenticated user
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : "";

    if (!idToken) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    // Fetch user's latest invoice from users_duplicate table
    const { data: userRow, error: fetchErr } = await supabaseServer
      .from("users_duplicate")
      .select("id, final_fee_payment, email, basic, contact")
      .eq("account->>firebase_uid", uid)
      .maybeSingle();

    if (fetchErr || !userRow) {
      return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    }

    const finalFee = (userRow as any).final_fee_payment || {};
    const invoices = finalFee.invoice || [];

    if (!Array.isArray(invoices) || invoices.length === 0) {
      return NextResponse.json({ error: "no_invoice_found" }, { status: 404 });
    }

    // Get the latest invoice
    const latestInvoice = invoices[invoices.length - 1];

    if (latestInvoice.url) {
      // Redirect to the invoice URL in storage
      return NextResponse.redirect(latestInvoice.url);
    }

    // If no URL, try to fetch from storage using invoice number
    if (latestInvoice.number) {
      const bucket = process.env.SUPABASE_INVOICE_BUCKET || "payment-proofs";
      const storagePath = `invoices/${userRow.id}/${latestInvoice.number}.pdf`;

      const { data: publicUrlData } = await (supabaseServer as any).storage
        .from(bucket)
        .getPublicUrl(storagePath);

      if (publicUrlData?.publicUrl) {
        return NextResponse.redirect(publicUrlData.publicUrl);
      }
    }

    return NextResponse.json({ error: "invoice_url_not_found" }, { status: 404 });
  } catch (err: any) {
    console.error("GET invoice error", err);
    return NextResponse.json(
      { error: "invoice_fetch_failed", hint: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const allowUnauth = process.env.ALLOW_UNAUTH_RAZORPAY === "true";
    let uid: string | null = null;
    if (!allowUnauth) {
      const authHeader = req.headers.get("authorization") || "";
      const idToken = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : "";
      if (!idToken)
        return NextResponse.json({ error: "invalid_token" }, { status: 401 });
      const decoded = await admin.auth().verifyIdToken(idToken);
      uid = decoded.uid;
    }

    const body = await req.json().catch(() => ({}));
    const paymentId: string | undefined = body?.paymentId;
    const orderId: string | undefined = body?.orderId;
    const amount: number | undefined = body?.amount;
    const currency: string = body?.currency || "INR";
    const course: string | undefined = body?.course;
    if (!paymentId || !orderId || !amount) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    if (!uid) {
      // In dev mode, just return a dummy success
      return NextResponse.json({ ok: true, dev: true });
    }

    // Fetch user for email/name
    const { data: userRow, error: selErr } = await supabaseServer
      .from("users")
      .select("id, email, student_name, application")
      .eq("firebase_uid", uid)
      .maybeSingle();
    if (selErr) throw selErr;
    if (!userRow)
      return NextResponse.json({ error: "user_not_found" }, { status: 404 });

    const studentName = (userRow as any).student_name || null;
    const email = (userRow as any).email || null;
    const issuedAt = new Date().toISOString();
    const inv = {
      studentName,
      email,
      course: course || null,
      orderId,
      paymentId,
      amount,
      currency,
      issuedAt,
    };

    // Render PDF
    const pdfBytes = await renderInvoicePdf(inv);
    const fileName = `invoice_${paymentId}.pdf`;

    // Upload to Supabase Storage (bucket "invoices")
    const bucket = process.env.SUPABASE_INVOICE_BUCKET || "invoices";
    const { error: upErr } = await (supabaseServer as any).storage
      .from(bucket)
      .upload(fileName, Buffer.from(pdfBytes), {
        contentType: "application/pdf",
        upsert: true,
      });
    if (upErr) throw upErr;

    const { data: pub, error: urlErr } = await (supabaseServer as any).storage
      .from(bucket)
      .getPublicUrl(fileName);
    if (urlErr) throw urlErr;
    const invoiceUrl = pub?.publicUrl || null;

    // Persist invoice record in application JSON
    const app = ((userRow as any).application as any) || {};
    const invoices: any[] = Array.isArray(app.invoices) ? app.invoices : [];
    if (!invoices.some((x) => x && x.paymentId === paymentId)) {
      invoices.push({
        paymentId,
        orderId,
        amount,
        currency,
        course,
        url: invoiceUrl,
        created_at: issuedAt,
      });
    }
    const newApp = { ...app, invoices };
    await supabaseServer
      .from("users")
      .update({ application: newApp })
      .eq("firebase_uid", uid);

    // Email to user
    if (email) {
      const html = renderInvoiceHtml(inv);
      await sendMail({
        to: email,
        subject: `Receipt: ${paymentId}`,
        html,
        attachments: [
          {
            filename: fileName,
            content: Buffer.from(pdfBytes),
            contentType: "application/pdf",
          },
        ],
      });
    }

    return NextResponse.json({ ok: true, url: invoiceUrl });
  } catch (err: any) {
    console.error("invoice error", err);
    return NextResponse.json(
      { error: "invoice_failed", hint: err?.message || String(err) },
      { status: 500 }
    );
  }
}
