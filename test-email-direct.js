/**
 * Direct SMTP test - bypasses Firebase, tests SendGrid directly
 * Run with: node test-email-direct.js
 */

const nodemailer = require("nodemailer");

async function testSMTP() {
  console.log("🧪 Testing SendGrid SMTP connection...\n");

  // Load environment variables
  require("dotenv").config({ path: ".env.local" });

  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  console.log("Configuration:");
  console.log("  Host:", config.host);
  console.log("  Port:", config.port);
  console.log("  User:", config.auth.user);
  console.log("  Pass:", config.auth.pass ? "***" + config.auth.pass.slice(-10) : "NOT SET");
  console.log();

  if (!config.host || !config.auth.user || !config.auth.pass) {
    console.error("❌ ERROR: Missing SMTP configuration in .env.local");
    console.error("Required: SMTP_HOST, SMTP_USER, SMTP_PASS");
    return;
  }

  try {
    console.log("Creating transporter...");
    const transporter = nodemailer.createTransport(config);

    console.log("Verifying connection...");
    await transporter.verify();
    console.log("✅ SMTP connection successful!\n");

    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || "noreply@neramclasses.com",
      to: "harrybabu93@gmail.com", // Change this to your email
      subject: "Test Email from Neram Classes",
      text: "This is a test email to verify SMTP configuration works.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #FF105E;">Test Email</h2>
          <p>This is a test email from Neram Classes to verify SMTP configuration.</p>
          <p><strong>If you received this, SendGrid is working! ✅</strong></p>
        </div>
      `,
    });

    console.log("\n✅ SUCCESS! Email sent!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    console.log("\n📬 Check your inbox: harrybabu93@gmail.com");
    console.log("\nIf email doesn't arrive:");
    console.log("1. Check SendGrid Activity Feed: https://app.sendgrid.com/email_activity");
    console.log("2. Verify sender in SendGrid: https://app.sendgrid.com/settings/sender_auth/senders");
    console.log("3. Check spam folder");
  } catch (error) {
    console.error("\n❌ ERROR!");
    console.error("Error:", error.message);

    if (error.code === "EAUTH") {
      console.error("\n🔑 Authentication failed!");
      console.error("- Check your SendGrid API key is correct");
      console.error("- Make sure SMTP_USER=apikey (literal string)");
      console.error("- Make sure SMTP_PASS=SG.your_api_key_here");
    } else if (error.code === "ECONNREFUSED") {
      console.error("\n🌐 Connection refused!");
      console.error("- Check SMTP_HOST=smtp.sendgrid.net");
      console.error("- Check SMTP_PORT=587");
      console.error("- Check your firewall/network");
    } else {
      console.error("\nFull error:", error);
    }
  }
}

testSMTP();
