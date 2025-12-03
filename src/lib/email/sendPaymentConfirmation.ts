/**
 * SendGrid Email Service for Payment Confirmations
 * Sends professional invoice emails using nodemailer + SendGrid SMTP
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

interface PaymentDetails {
  userName: string;
  userEmail: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  paidAt: string;
  courseName?: string;
  invoiceNumber?: string;
}

// Create reusable transporter
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Generate professional invoice HTML email template
 */
function generateInvoiceHTML(payment: PaymentDetails): string {
  const formattedDate = new Date(payment.paidAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });

  const invoiceNum =
    payment.invoiceNumber ||
    `INV-${new Date(payment.paidAt).getFullYear()}-${payment.paymentId
      .substring(4, 10)
      .toUpperCase()}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation - ${invoiceNum}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #1976d2;
    }
    .message {
      margin-bottom: 25px;
      line-height: 1.8;
    }
    .invoice-box {
      background: #f8f9fa;
      border-left: 4px solid #1976d2;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .invoice-box h2 {
      font-size: 18px;
      margin-bottom: 15px;
      color: #1565c0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #555;
    }
    .detail-value {
      color: #333;
      text-align: right;
    }
    .amount-row {
      background: white;
      padding: 15px;
      margin-top: 10px;
      border-radius: 4px;
      border: 2px solid #1976d2;
    }
    .amount-row .detail-label {
      font-size: 18px;
      color: #1976d2;
    }
    .amount-row .detail-value {
      font-size: 24px;
      font-weight: bold;
      color: #1976d2;
    }
    .success-badge {
      display: inline-block;
      background: #4caf50;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 15px;
    }
    .help-section {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .help-section p {
      margin: 0;
      color: #856404;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }
    .footer p {
      margin: 5px 0;
    }
    .footer a {
      color: #1976d2;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        margin: 0;
        border-radius: 0;
      }
      .content {
        padding: 20px 15px;
      }
      .detail-row {
        flex-direction: column;
      }
      .detail-value {
        text-align: left;
        margin-top: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Payment Confirmation</h1>
      <p>Thank you for your payment</p>
    </div>

    <div class="content">
      <div class="success-badge">✓ Payment Successful</div>
      
      <p class="greeting">Dear ${payment.userName},</p>

      <div class="message">
        <p>Thank you for your payment! We have successfully received your payment and processed your transaction.</p>
        <p style="margin-top: 10px;">This email serves as your official payment receipt and invoice.</p>
      </div>

      <div class="invoice-box">
        <h2>Invoice Details</h2>
        
        <div class="detail-row">
          <span class="detail-label">Invoice Number:</span>
          <span class="detail-value">${invoiceNum}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Order ID:</span>
          <span class="detail-value">${payment.orderId}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Payment ID:</span>
          <span class="detail-value">${payment.paymentId}</span>
        </div>

        ${
          payment.courseName
            ? `
        <div class="detail-row">
          <span class="detail-label">Course/Program:</span>
          <span class="detail-value">${payment.courseName}</span>
        </div>
        `
            : ""
        }

        <div class="detail-row">
          <span class="detail-label">Payment Date:</span>
          <span class="detail-value">${formattedDate}</span>
        </div>

        <div class="amount-row">
          <div class="detail-row" style="border: none;">
            <span class="detail-label">Total Amount Paid:</span>
            <span class="detail-value">${
              payment.currency
            } ${payment.amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}</span>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${
          process.env.NEXT_PUBLIC_BASE_URL || "https://neram.co.in"
        }/premium"
           style="display: inline-block; background: #1976d2; color: white; padding: 14px 32px;
                  text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Access Your Premium Dashboard
        </a>
        <p style="font-size: 14px; color: #666; margin-top: 12px;">
          Click the button above to access all premium features
        </p>
      </div>

      <div class="help-section">
        <p><strong>Need Help?</strong> If you have any questions about this payment or need assistance, please contact us at <strong>${
          process.env.HELP_DESK_EMAIL || "support@neram.co.in"
        }</strong></p>
      </div>

      <div class="message">
        <p style="font-size: 14px; color: #666;">Please keep this email for your records. You may need to present this invoice for verification purposes.</p>
      </div>
    </div>

    <div class="footer">
      <p><strong>Neram Classes</strong></p>
      <p>© ${new Date().getFullYear()} Neram Classes. All rights reserved.</p>
      <p style="margin-top: 10px;">This is an automated email. Please do not reply to this message.</p>
      <p>For support, contact: ${
        process.env.HELP_DESK_EMAIL || "support@neram.co.in"
      }</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send payment confirmation email via SendGrid
 */
export async function sendPaymentConfirmation(
  payment: PaymentDetails,
  pdfAttachment?: Buffer
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transport = getTransporter();

    // Verify transporter configuration (optional, for debugging)
    if (process.env.NODE_ENV === "development") {
      await transport.verify();
      console.log("✅ SMTP transporter verified");
    }

    const mailOptions = {
      from: {
        name: "Neram Classes",
        address: process.env.MAIL_FROM || "noreply@neramclasses.com",
      },
      to: payment.userEmail,
      subject: `Payment Confirmation - Invoice ${
        payment.invoiceNumber || payment.orderId
      }`,
      html: generateInvoiceHTML(payment),
      attachments: pdfAttachment
        ? [
            {
              filename: `Invoice_${
                payment.invoiceNumber || payment.orderId
              }.pdf`,
              content: pdfAttachment,
              contentType: "application/pdf",
            },
          ]
        : undefined,
    };

    // Send email
    const info = await transport.sendMail(mailOptions);

    console.log("✅ Payment confirmation email sent successfully", {
      messageId: info.messageId,
      email: payment.userEmail,
      invoiceNumber: payment.invoiceNumber,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Failed to send payment confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Send admin notification email for new payments
 */
export async function sendAdminPaymentNotification(params: {
  studentName: string;
  studentEmail: string;
  amount: number;
  paymentId: string;
  orderId: string;
  paymentMethod?: string;
}): Promise<void> {
  try {
    const adminEmails =
      process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];

    if (adminEmails.length === 0) {
      console.log("⚠️ No admin emails configured, skipping admin notification");
      return;
    }

    const transport = getTransporter();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #1976d2;">New Payment Received</h2>
          <p>A new payment has been successfully processed:</p>
          <ul style="line-height: 1.8;">
            <li><strong>Student:</strong> ${params.studentName}</li>
            <li><strong>Email:</strong> ${params.studentEmail}</li>
            <li><strong>Amount:</strong> ₹${params.amount.toLocaleString(
              "en-IN"
            )}</li>
            <li><strong>Payment ID:</strong> ${params.paymentId}</li>
            <li><strong>Order ID:</strong> ${params.orderId}</li>
            <li><strong>Method:</strong> ${params.paymentMethod || "N/A"}</li>
          </ul>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This is an automated notification from Neram Classes payment system.
          </p>
        </div>
      </div>
    `;

    await transport.sendMail({
      from: {
        name: "Neram Payment System",
        address: process.env.MAIL_FROM || "noreply@neramclasses.com",
      },
      to: adminEmails,
      subject: `New Payment: ₹${params.amount.toLocaleString("en-IN")} from ${
        params.studentName
      }`,
      html: htmlContent,
    });

    console.log(
      "✅ Admin payment notification sent to:",
      adminEmails.join(", ")
    );
  } catch (error) {
    console.error("❌ Failed to send admin notification:", error);
    // Don't throw - admin notification failures shouldn't break the flow
  }
}
