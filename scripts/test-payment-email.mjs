/**
 * Test Script for Payment Confirmation Email
 * Tests SendGrid integration with invoice PDF attachment
 *
 * Usage: node scripts/test-payment-email.mjs
 */

import { config } from "dotenv";
import nodemailer from "nodemailer";

// Load environment variables
config({ path: ".env.local" });

console.log("🧪 Testing Payment Confirmation Email Setup\n");

// Verify required environment variables
const requiredEnvVars = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  MAIL_FROM: process.env.MAIL_FROM,
};

console.log("📋 Environment Check:");
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    console.error(`❌ ${key} is not set`);
    process.exit(1);
  }
  console.log(`✅ ${key}: ${key === "SMTP_PASS" ? "***" : value}`);
}
console.log("");

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Test SMTP connection
console.log("🔌 Testing SMTP Connection...");
try {
  await transporter.verify();
  console.log("✅ SMTP connection verified successfully!\n");
} catch (error) {
  console.error("❌ SMTP connection failed:", error.message);
  process.exit(1);
}

// Generate test invoice HTML
function generateTestInvoiceHTML() {
  const invoiceNumber = "INV-2025-TEST01";
  const paidAt = new Date().toISOString();
  const formattedDate = new Date(paidAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1976d2, #1565c0); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .invoice-box { background: #f8f9fa; border-left: 4px solid #1976d2; padding: 20px; margin: 20px 0; }
    .amount { font-size: 24px; font-weight: bold; color: #1976d2; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Confirmation - TEST</h1>
    </div>
    <div class="content">
      <p><strong>Dear Test User,</strong></p>
      <p>This is a test email for payment confirmation setup.</p>
      <div class="invoice-box">
        <h3>Test Invoice Details</h3>
        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p><strong>Order ID:</strong> order_test_123456</p>
        <p><strong>Payment ID:</strong> pay_test_abcdef</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p class="amount">Amount: INR 1,000.00</p>
      </div>
      <p>If you received this email, your SendGrid configuration is working correctly!</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Send test email to both admin and user email
console.log("📧 Sending test payment confirmation emails...");

// Get admin email
const adminEmail =
  process.env.ADMIN_EMAILS?.split(",")[0] || process.env.HELP_DESK_EMAIL;

// Get test user email (you can pass as arg or use default)
const userEmail = process.argv[2] || "findhari93@gmail.com"; // Replace with your test email

if (!adminEmail) {
  console.error("❌ No admin email found. Set ADMIN_EMAILS in .env.local");
  process.exit(1);
}

const recipients = [
  { email: userEmail, type: "User" },
  { email: adminEmail, type: "Admin" },
];

console.log(`\n📨 Sending to ${recipients.length} recipient(s):\n`);

for (const recipient of recipients) {
  try {
    const info = await transporter.sendMail({
      from: {
        name: "Neram Classes - Test",
        address: process.env.MAIL_FROM,
      },
      to: recipient.email,
      subject: "Test: Payment Confirmation Email Setup",
      html: generateTestInvoiceHTML(),
    });

    console.log(`✅ [${recipient.type}] Email sent to: ${recipient.email}`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(
      `   Status: ${info.accepted.length > 0 ? "Accepted" : "Rejected"}\n`
    );
  } catch (error) {
    console.error(
      `❌ [${recipient.type}] Failed to send to ${recipient.email}:`,
      error.message,
      "\n"
    );
  }
}

console.log("✨ Check both inboxes to verify emails were delivered!\n");
console.log("📝 Next Steps:");
console.log("   1. Check spam folders if not in inbox");
console.log(
  "   2. To test with different user email: npm run test:email user@example.com"
);
console.log("   3. Run: npm run test:webhook (to test full payment flow)");
console.log("   4. Monitor SendGrid dashboard for delivery status\n");
