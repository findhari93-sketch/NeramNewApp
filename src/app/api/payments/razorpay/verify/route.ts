export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { verifyPaymentTokenServer } from "@/lib/validatePaymentToken";
import { generateInvoicePDF, generateInvoiceNumber, InvoiceData } from "@/lib/generateInvoicePDF";
import { getGraphToken, sendEmailWithAttachment, generateInvoiceEmailHTML, sendAdminPaymentNotification } from "@/lib/emailService";

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

    const finalFee = (application.final_fee_payment as any) || {};
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

    // Extract payment amount from admin_filled data
    const appDetails = application.application_details || {};
    const adminFilled = appDetails.admin_filled || {};
    const totalCourseFees = Number(adminFilled.total_course_fees || 0);
    const discount = Number(adminFilled.discount || 0);
    const calculatedPayableAmount = totalCourseFees - discount;

    // Use stored payable_amount if exists, otherwise use calculated amount
    const payableAmount = finalFee.payable_amount || calculatedPayableAmount || 0;

    const now = new Date().toISOString();
    const newPaymentHistory = [
      ...paymentHistory,
      {
        event: "payment.verified",
        paymentId,
        orderId,
        amount: payableAmount,
        ts: now,
        source: "verify",
      },
    ];

    const updatedFinalFee = {
      ...finalFee,
      token_used: true,
      payment_status: "paid",
      payment_method: "Razorpay",
      payable_amount: payableAmount,
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

    // ===== Generate and send invoice (non-blocking for payment success) =====
    try {
      console.log("[verify] Generating invoice PDF...");

      // Extract student and course details
      const studentName = application.student_name || application.basic?.student_name || application.name || "Student";
      const studentEmail = application.email || application.contact?.email;
      const studentPhone = application.contact?.phone || application.phone;

      console.log("[verify] Student details:", { studentName, studentEmail, studentPhone });

      const courseName = adminFilled.final_course_Name || application.selected_course || "N/A";
      const courseDuration = adminFilled.course_duration || "N/A";

      // Use the payableAmount we calculated earlier
      const amountPaid = payableAmount;

      console.log("[verify] Payment details:", { totalCourseFees, discount, amountPaid });

      const paymentOptions = adminFilled.payment_options;
      const paymentTypeRaw = Array.isArray(paymentOptions) ? String(paymentOptions[0] || "partial").toLowerCase() : String(paymentOptions || "partial").toLowerCase();

      const invoiceNumber = generateInvoiceNumber(applicationId);
      const paymentDate = now;

      const invoiceData: InvoiceData = {
        invoiceNumber,
        invoiceDate: paymentDate,
        applicationId: applicationId,
        studentName,
        studentEmail: studentEmail || "",
        studentPhone,
        courseName,
        courseDuration,
        paymentId: paymentId,
        orderId: orderId,
        paymentMethod: "Razorpay",
        paymentDate,
        totalCourseFees,
        discount,
        amountPaid,
        paymentType: paymentTypeRaw === "full" ? "Full Payment" : "Partial Payment",
      };

      const pdfBuffer = await generateInvoicePDF(invoiceData);
      console.log("[verify] Invoice PDF generated successfully");

      // Upload PDF to Supabase Storage for permanent records
      const storagePath = `invoices/${applicationId}/${invoiceNumber}.pdf`;
      const uploadRes = await supabase.storage
        .from("payment-proofs")
        .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

      let invoiceUrl: string | null = null;
      if (uploadRes?.data?.path) {
        const { data: publicUrlData } = await supabase.storage
          .from("payment-proofs")
          .getPublicUrl(uploadRes.data.path);
        invoiceUrl = publicUrlData?.publicUrl || null;
        console.log("[verify] Invoice PDF uploaded:", invoiceUrl || uploadRes.data.path);
      } else if (uploadRes?.error) {
        console.warn("[verify] Failed to upload invoice PDF:", uploadRes.error);
      }

      if (studentEmail) {
        console.log(`[verify] Attempting to send invoice email to ${studentEmail}`);
        try {
          const graphToken = await getGraphToken();
          if (graphToken) {
            console.log("[verify] Graph token obtained successfully");
            const emailHTML = generateInvoiceEmailHTML({
              studentName,
              courseName,
              amountPaid,
              paymentId,
              invoiceNumber,
              paymentDate,
            });

            const attachmentName = `Invoice_${invoiceNumber}.pdf`;

            await sendEmailWithAttachment(
              graphToken,
              studentEmail,
              `Payment Invoice - ${invoiceNumber}`,
              emailHTML,
              pdfBuffer,
              attachmentName
            );
            console.log(`[verify] ✅ Invoice email sent successfully to ${studentEmail}`);
          } else {
            console.error("[verify] ❌ Failed to get Graph token - Email credentials not configured");
            console.error("[verify] Required env vars: AZ_TENANT_ID, AZ_CLIENT_ID, AZ_CLIENT_SECRET, AZ_SENDER_USER");
          }
        } catch (emailError) {
          console.error("[verify] ❌ Failed to send invoice email:", emailError);
          if (emailError instanceof Error) {
            console.error("[verify] Email error details:", emailError.message);
          }
        }
      } else {
        console.error("[verify] ❌ No email address found for student - invoice not sent");
        console.error("[verify] Checked fields: application.email, application.contact?.email");
      }

      // Persist invoice details under payment details as an array
      const existingInvoices: any[] = Array.isArray(updatedFinalFee.invoice) ? updatedFinalFee.invoice : [];
      const newInvoiceEntry = {
        number: invoiceNumber,
        date: paymentDate,
        amount_paid: amountPaid,
        total_course_fees: totalCourseFees,
        discount,
        payment_id: paymentId,
        order_id: orderId,
        method: "Razorpay",
        url: invoiceUrl,
        emailed_to: studentEmail || null,
        emailed_at: studentEmail ? paymentDate : null,
      };
      const updatedFinalFeeWithInvoice = { ...updatedFinalFee, invoice: [...existingInvoices, newInvoiceEntry] };

      await supabase
        .from("users_duplicate")
        .update({ final_fee_payment: updatedFinalFeeWithInvoice, updated_at: now })
        .eq("id", applicationId);

      console.log("[verify] Invoice details stored under final_fee_payment.invoice[]");

      // Notify admin via notifications table (optional; does not block)
      try {
        await supabase
          .from("notifications")
          .insert({
            user_id: applicationId,
            notification_type: "payment_verified",
            title: "Payment Verified",
            message: `Invoice ${invoiceNumber} generated. Amount: ₹${amountPaid.toLocaleString("en-IN")}`,
          });
        console.log("[verify] Admin notification inserted");
      } catch (nErr) {
        console.warn("[verify] Failed to insert admin notification:", nErr);
      }

      // Send admin email notification
      try {
        console.log("[verify] Sending admin email notification...");
        await sendAdminPaymentNotification({
          studentName,
          studentEmail: studentEmail || "Not provided",
          courseName,
          amountPaid,
          paymentId,
          orderId,
          paymentMethod: "Razorpay",
          paymentDate: now,
          applicationId,
        });
        console.log("[verify] ✅ Admin email notification sent successfully");
      } catch (adminEmailErr) {
        console.error("[verify] ❌ Failed to send admin email notification:", adminEmailErr);
      }
    } catch (invoiceErr) {
      console.error("[verify] Failed to generate/send invoice:", invoiceErr);
      console.error("[verify] Payment was successful, but invoice could not be sent");
    }

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
