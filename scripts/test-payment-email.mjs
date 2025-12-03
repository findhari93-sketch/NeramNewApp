/**
 * Test Script for Payment Confirmation Email
 * Tests SendGrid integration with invoice PDF attachment
 *
 * Usage: node scripts/test-payment-email.mjs [recipient-email]
 * Example: node scripts/test-payment-email.mjs user@example.com
 */

import { config } from "dotenv";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Load environment variables
config({ path: join(__dirname, "..", ".env.local") });

// Dynamic imports for TypeScript modules
const { sendPaymentConfirmation, sendAdminPaymentNotification } = await import(
  "../src/lib/email/sendPaymentConfirmation.ts"
);
const { renderInvoicePdf } = await import("../src/lib/invoice.ts");

console.log("🧪 Testing Payment Confirmation Email\n");
console.log("=====================================\n");

// Get recipient email from command line
const userEmail = process.argv[2];

if (!userEmail) {
  console.error("❌ Error: Please provide a recipient email address");
  console.log("Usage: node scripts/test-payment-email.mjs <recipient-email>");
  console.log("Example: node scripts/test-payment-email.mjs user@example.com\n");
  process.exit(1);
}

// Verify required environment variables
const requiredEnvVars = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  MAIL_FROM: process.env.MAIL_FROM,
};

console.log("📋 Environment Configuration:");
console.log(`  SMTP Host: ${process.env.SMTP_HOST || "❌ Not set"}`);
console.log(`  SMTP Port: ${process.env.SMTP_PORT || "❌ Not set"}`);
console.log(`  SMTP User: ${process.env.SMTP_USER || "❌ Not set"}`);
console.log(
  `  SMTP Pass: ${process.env.SMTP_PASS ? "✓ Configured" : "❌ Not set"}`
);
console.log(`  Mail From: ${process.env.MAIL_FROM || "❌ Not set"}`);
console.log(
  `  Help Desk: ${process.env.HELP_DESK_EMAIL || "support@neram.co.in"}`
);
console.log(
  `  Base URL: ${process.env.NEXT_PUBLIC_BASE_URL || "https://neram.co.in"}`
);
console.log(
  `  Admin Emails: ${process.env.ADMIN_EMAILS || "❌ Not configured"}`
);
console.log("");

// Check for missing variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key, _]) => key);

if (missingVars.length > 0) {
  console.error("❌ Missing required variables:", missingVars.join(", "));
  console.log("\nPlease configure these in your .env.local file\n");
  process.exit(1);
}

// Test payment data
const testPayment = {
  userName: "Test Student",
  userEmail: userEmail,
  orderId: "order_TEST" + Date.now(),
  paymentId: "pay_TEST" + Date.now(),
  amount: 15000,
  currency: "INR",
  paidAt: new Date().toISOString(),
  courseName: "NATA/JEE Coaching Premium",
  invoiceNumber: `INV-${new Date().getFullYear()}-TEST${String(Date.now()).slice(-6)}`,
};

console.log("📝 Test Payment Details:");
console.log(`  Student Name: ${testPayment.userName}`);
console.log(`  Email: ${testPayment.userEmail}`);
console.log(`  Amount: ₹${testPayment.amount.toLocaleString("en-IN")}`);
console.log(`  Course: ${testPayment.courseName}`);
console.log(`  Order ID: ${testPayment.orderId}`);
console.log(`  Payment ID: ${testPayment.paymentId}`);
console.log(`  Invoice #: ${testPayment.invoiceNumber}`);
console.log("");

try {
  // Generate invoice PDF
  console.log("📄 Generating invoice PDF...");
  const pdfBytes = await renderInvoicePdf({
    studentName: testPayment.userName,
    email: testPayment.userEmail,
    course: testPayment.courseName,
    orderId: testPayment.orderId,
    paymentId: testPayment.paymentId,
    amount: testPayment.amount,
    currency: testPayment.currency,
    issuedAt: testPayment.paidAt,
  });
  console.log("✅ Invoice PDF generated successfully");
  console.log(`   Size: ${(pdfBytes.length / 1024).toFixed(2)} KB\n`);

  // Send user payment confirmation email
  console.log("📧 Sending payment confirmation email to user...");
  const userResult = await sendPaymentConfirmation(
    testPayment,
    Buffer.from(pdfBytes)
  );

  if (userResult.success) {
    console.log("✅ User email sent successfully!");
    console.log(`   Recipient: ${userEmail}`);
    console.log(`   Message ID: ${userResult.messageId}`);
    console.log("");
  } else {
    console.error("❌ Failed to send user email");
    console.error(`   Error: ${userResult.error}\n`);
  }

  // Send admin notification
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim());
  if (adminEmails && adminEmails.length > 0) {
    console.log("📧 Sending admin notification...");
    await sendAdminPaymentNotification({
      studentName: testPayment.userName,
      studentEmail: testPayment.userEmail,
      amount: testPayment.amount,
      paymentId: testPayment.paymentId,
      orderId: testPayment.orderId,
      paymentMethod: "test",
    });
    console.log("✅ Admin notification sent!");
    console.log(`   Recipients: ${adminEmails.join(", ")}`);
    console.log("");
  } else {
    console.log("⚠️  No admin emails configured, skipping admin notification\n");
  }

  // Success summary
  console.log("═══════════════════════════════════════");
  console.log("🎉 Test completed successfully!");
  console.log("═══════════════════════════════════════");
  console.log("\n📬 Please check the following:");
  console.log(`   1. User inbox: ${userEmail}`);
  if (adminEmails && adminEmails.length > 0) {
    console.log(`   2. Admin inbox(es): ${adminEmails.join(", ")}`);
  }
  console.log("   3. Check spam/junk folders");
  console.log("   4. SendGrid dashboard for delivery status");
  console.log("\n✨ The email includes:");
  console.log("   • Payment confirmation with invoice details");
  console.log("   • PDF invoice attachment");
  console.log('   • "Access Your Premium Dashboard" button');
  console.log("   • Support contact information");
  console.log("");
} catch (error) {
  console.error("❌ Test failed with error:");
  console.error(error);
  console.log("");
  process.exit(1);
}
