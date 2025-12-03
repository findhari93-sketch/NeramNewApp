/**
 * Microsoft Graph API Email Service for Payment Confirmations
 * Uses Azure AD / Microsoft 365 to send emails (same as application submission)
 */

import { renderInvoicePdf } from "../invoice";

interface PaymentEmailParams {
  userEmail: string;
  studentName: string;
  courseName: string;
  amountPaid: number;
  paymentId: string;
  orderId: string;
  paymentDate: string;
}

/**
 * Get Azure AD access token for Microsoft Graph API
 */
async function getGraphToken(): Promise<string> {
  const tokenRes = await fetch(
    `https://login.microsoftonline.com/${process.env.AZ_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AZ_CLIENT_ID!,
        client_secret: process.env.AZ_CLIENT_SECRET!,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );

  if (!tokenRes.ok) {
    const error = await tokenRes.text();
    throw new Error(`Failed to get Azure token: ${error}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

/**
 * Generate payment confirmation email HTML
 */
function generatePaymentEmailHTML(params: PaymentEmailParams): string {
  const {
    studentName,
    courseName,
    amountPaid,
    paymentId,
    orderId,
    paymentDate,
  } = params;

  const formattedDate = new Date(paymentDate).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });

  const invoiceNum = `INV-${new Date(paymentDate).getFullYear()}-${paymentId
    .substring(4, 10)
    .toUpperCase()}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 8px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .content { padding: 30px 20px; }
    .greeting { font-size: 18px; color: #1976d2; margin-bottom: 20px; }
    .success-badge { background: #4caf50; color: white; padding: 12px 20px; border-radius: 6px; text-align: center; font-size: 16px; font-weight: 600; margin: 20px 0; }
    .invoice-details { background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 6px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-weight: 600; color: #555; }
    .detail-value { color: #333; text-align: right; }
    .amount-highlight { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0; }
    .amount-highlight .amount { font-size: 32px; font-weight: bold; }
    .next-steps { background: #e3f2fd; border-left: 4px solid #1976d2; padding: 15px; margin: 20px 0; }
    .next-steps h3 { color: #1976d2; margin-bottom: 10px; }
    .next-steps ul { margin-left: 20px; }
    .cta-button { display: inline-block; background: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; text-align: center; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #777; font-size: 12px; border-top: 1px solid #e0e0e0; }
    .footer-links { margin: 10px 0; }
    .footer-links a { color: #1976d2; text-decoration: none; margin: 0 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Successful!</h1>
      <p>Thank you for your payment</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Dear ${studentName},
      </div>

      <div class="success-badge">
        🎉 Your payment has been successfully received!
      </div>

      <p>We are delighted to confirm that your payment for <strong>${courseName}</strong> has been processed successfully. Your invoice is attached to this email for your records.</p>

      <div class="amount-highlight">
        <div style="opacity: 0.9; font-size: 14px;">Amount Paid</div>
        <div class="amount">₹${amountPaid.toLocaleString("en-IN")}</div>
      </div>

      <div class="invoice-details">
        <h3 style="color: #1976d2; margin-bottom: 15px;">Payment Details</h3>
        <div class="detail-row">
          <span class="detail-label">Invoice Number:</span>
          <span class="detail-value">${invoiceNum}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment ID:</span>
          <span class="detail-value">${paymentId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Order ID:</span>
          <span class="detail-value">${orderId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Course:</span>
          <span class="detail-value">${courseName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Date:</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount:</span>
          <span class="detail-value"><strong>₹${amountPaid.toLocaleString(
            "en-IN"
          )}</strong></span>
        </div>
      </div>

      <div class="next-steps">
        <h3>📚 What's Next?</h3>
        <ul>
          <li>Your account has been upgraded to <strong>Premium</strong></li>
          <li>Access your study materials and resources in the student portal</li>
          <li>Check your email for class schedule and login credentials</li>
          <li>Join our WhatsApp group for updates and announcements</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://neramclasses.com/premium" class="cta-button" style="color: white;">
          Access Premium Dashboard →
        </a>
      </div>

      <p style="color: #777; font-size: 14px; margin-top: 30px;">
        If you have any questions or concerns, please don't hesitate to contact our support team at <a href="mailto:support@neramclasses.com" style="color: #1976d2;">support@neramclasses.com</a>
      </p>
    </div>

    <div class="footer">
      <p><strong>Neram Classes</strong></p>
      <p>Excellence in NATA & JEE Architecture Preparation</p>
      <div class="footer-links">
        <a href="https://neramclasses.com">Website</a> |
        <a href="https://neramclasses.com/contact">Contact</a> |
        <a href="https://neramclasses.com/premium">Premium Access</a>
      </div>
      <p style="margin-top: 10px;">© ${new Date().getFullYear()} Neram. All rights reserved.</p>
      <p style="font-size: 11px; color: #999; margin-top: 10px;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate admin notification email HTML
 */
function generateAdminEmailHTML(params: PaymentEmailParams): string {
  const {
    studentName,
    userEmail,
    courseName,
    amountPaid,
    paymentId,
    orderId,
    paymentDate,
  } = params;

  const formattedDate = new Date(paymentDate).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; color: #4caf50; margin-bottom: 10px; border-bottom: 2px solid #4caf50; padding-bottom: 5px; }
    .info-row { display: flex; margin-bottom: 8px; }
    .info-label { font-weight: bold; min-width: 150px; color: #555; }
    .info-value { color: #333; }
    .amount-badge { background: #4caf50; color: white; padding: 15px; border-radius: 6px; text-align: center; margin: 15px 0; font-size: 24px; font-weight: bold; }
    .footer { text-align: center; color: #777; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">💰 New Payment Received</h2>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Neram Admin Notification</p>
    </div>
    
    <div class="content">
      <div class="amount-badge">
        ₹${amountPaid.toLocaleString("en-IN")}
      </div>

      <div class="section">
        <div class="section-title">Student Information</div>
        <div class="info-row">
          <span class="info-label">Name:</span>
          <span class="info-value">${studentName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${userEmail}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Course:</span>
          <span class="info-value">${courseName}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Payment Details</div>
        <div class="info-row">
          <span class="info-label">Payment ID:</span>
          <span class="info-value">${paymentId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Order ID:</span>
          <span class="info-value">${orderId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Amount:</span>
          <span class="info-value">₹${amountPaid.toLocaleString("en-IN")}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date & Time:</span>
          <span class="info-value">${formattedDate}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated notification from Neram Payment System.</p>
      <p>© ${new Date().getFullYear()} Neram. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send payment confirmation email to student with invoice PDF attachment
 */
export async function sendPaymentConfirmationEmail(
  params: PaymentEmailParams
): Promise<void> {
  try {
    console.log("[Graph Email] === STARTING PAYMENT CONFIRMATION EMAIL ===");
    console.log("[Graph Email] Parameters:", JSON.stringify(params, null, 2));
    
    console.log("[Graph Email] Step 1: Getting Azure AD token...");
    const token = await getGraphToken();
    console.log("[Graph Email] ✅ Token acquired");

    console.log("[Graph Email] Step 2: Generating email HTML...");
    const emailHtml = generatePaymentEmailHTML(params);
    console.log("[Graph Email] ✅ HTML generated, length:", emailHtml.length);

    console.log("[Graph Email] Step 3: Generating PDF invoice...");
    // Generate PDF invoice
    const invoiceData = {
      studentName: params.studentName,
      email: params.userEmail,
      course: params.courseName,
      orderId: params.orderId,
      paymentId: params.paymentId,
      amount: params.amountPaid,
      currency: "INR",
      issuedAt: params.paymentDate,
    };

    const pdfBytes = await renderInvoicePdf(invoiceData);
    console.log("[Graph Email] ✅ PDF generated, size:", pdfBytes.length, "bytes");
    
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");
    console.log("[Graph Email] ✅ PDF encoded to base64");

    const invoiceNum = `INV-${new Date(
      params.paymentDate
    ).getFullYear()}-${params.paymentId.substring(4, 10).toUpperCase()}`;
    console.log("[Graph Email] Invoice number:", invoiceNum);

    const message = {
      message: {
        subject: `✅ Payment Confirmation - ${invoiceNum} | Neram Classes`,
        body: {
          contentType: "HTML",
          content: emailHtml,
        },
        toRecipients: [
          {
            emailAddress: {
              address: params.userEmail,
            },
          },
        ],
        attachments: [
          {
            "@odata.type": "#microsoft.graph.fileAttachment",
            name: `${invoiceNum}.pdf`,
            contentType: "application/pdf",
            contentBytes: pdfBase64,
          },
        ],
      },
      saveToSentItems: true,
    };

    console.log("[Graph Email] Step 4: Sending via Microsoft Graph API...");
    console.log("[Graph Email] Sender:", process.env.AZ_SENDER_USER);
    console.log("[Graph Email] Recipient:", params.userEmail);

    const mailRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
        process.env.AZ_SENDER_USER!
      )}/sendMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      }
    );

    console.log("[Graph Email] Response status:", mailRes.status, mailRes.statusText);

    if (!mailRes.ok) {
      const error = await mailRes.text();
      console.error("[Graph Email] ❌ Email send FAILED!");
      console.error("[Graph Email] Error response:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    console.log("[Graph Email] ✅✅✅ Payment confirmation SENT successfully!");
    console.log("[Graph Email] === EMAIL COMPLETED ===");
  } catch (error: any) {
    console.error("[Graph Email] ❌❌❌ CRITICAL ERROR!");
    console.error("[Graph Email] Error:", error.message);
    console.error("[Graph Email] Stack:", error.stack);
    throw error;
  }
}

/**
 * Send admin notification email about new payment
 */
export async function sendAdminPaymentNotification(
  params: PaymentEmailParams
): Promise<void> {
  try {
    console.log("[Graph Email Admin] === STARTING ADMIN NOTIFICATION ===");
    console.log("[Graph Email Admin] Student:", params.studentName);
    console.log("[Graph Email Admin] Amount:", params.amountPaid);

    console.log("[Graph Email Admin] Step 1: Getting token...");
    const token = await getGraphToken();
    console.log("[Graph Email Admin] ✅ Token acquired");

    console.log("[Graph Email Admin] Step 2: Generating HTML...");
    const emailHtml = generateAdminEmailHTML(params);
    console.log("[Graph Email Admin] ✅ HTML generated");

    const message = {
      message: {
        subject: `💰 New Payment: ${
          params.studentName
        } - ₹${params.amountPaid.toLocaleString("en-IN")}`,
        body: {
          contentType: "HTML",
          content: emailHtml,
        },
        toRecipients: [
          {
            emailAddress: {
              address: process.env.ADMIN_EMAIL!,
            },
          },
          {
            emailAddress: {
              address: "support@neramclasses.com",
            },
          },
        ],
      },
      saveToSentItems: true,
    };

    console.log("[Graph Email Admin] Step 3: Sending to admins...");
    console.log("[Graph Email Admin] Recipients:", [process.env.ADMIN_EMAIL, "support@neramclasses.com"]);

    const mailRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
        process.env.AZ_SENDER_USER!
      )}/sendMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      }
    );

    console.log("[Graph Email Admin] Response status:", mailRes.status, mailRes.statusText);

    if (!mailRes.ok) {
      const error = await mailRes.text();
      console.error("[Graph Email Admin] ❌ Email send FAILED!");
      console.error("[Graph Email Admin] Error:", error);
      throw new Error(`Failed to send admin email: ${error}`);
    }

    console.log("[Graph Email Admin] ✅✅✅ Admin notification SENT!");
    console.log("[Graph Email Admin] === ADMIN EMAIL COMPLETED ===");
  } catch (error: any) {
    console.error("[Graph Email Admin] ❌❌❌ ERROR sending admin notification!");
    console.error("[Graph Email Admin] Error:", error.message);
    // Don't throw - admin email failure shouldn't block the webhook
  }
}
