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

    console.log("[Invoice] Looking up user with firebase_uid:", uid);

    // Fetch user's latest invoice from users_duplicate table
    // Note: firebase_uid is stored in account JSONB column
    const { data: userRow, error: fetchErr } = await supabaseServer
      .from("users_duplicate")
      .select("id, final_fee_payment, application_details, contact, basic")
      .eq("account->>firebase_uid", uid)
      .maybeSingle();

    console.log("[Invoice] Query result:", {
      found: !!userRow,
      error: fetchErr?.message,
      hasFinalFee: userRow ? !!(userRow as any).final_fee_payment : false,
    });

    if (fetchErr || !userRow) {
      console.log("[Invoice] User not found, returning 404");
      return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    }

    const finalFee = (userRow as any).final_fee_payment || {};
    const appDetails = (userRow as any).application_details || {};
    const paymentHistory = finalFee.payment_history || [];

    console.log("[Invoice] Payment status:", finalFee.payment_status);

    // Check if payment was successful
    if (finalFee.payment_status !== "paid") {
      console.log("[Invoice] No payment completed, returning 404");
      return NextResponse.json(
        { error: "no_payment_completed" },
        { status: 404 }
      );
    }

    // Generate invoice on-the-fly from payment details
    const basic = (userRow as any).basic || {};
    const contact = (userRow as any).contact || {};

    const invoiceData = {
      studentName: basic.student_name || basic.name || "Student",
      email: contact.email || "",
      course:
        appDetails.course_name || finalFee.course_name || "NATA/JEE Coaching",
      orderId: finalFee.razorpay_order_id || "",
      paymentId: finalFee.razorpay_payment_id || "",
      amount: finalFee.payable_amount || finalFee.amount || 0,
      currency: "INR",
      issuedAt: finalFee.payment_at || new Date().toISOString(),
    };

    // Generate PDF invoice
    const pdfBytes = await renderInvoicePdf(invoiceData);

    // Return PDF directly
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice_${invoiceData.paymentId}.pdf"`,
      },
    });
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
