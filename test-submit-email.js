// Load .env.local explicitly
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env.local") });

const required = [
  "AZ_TENANT_ID",
  "AZ_CLIENT_ID",
  "AZ_CLIENT_SECRET",
  "AZ_SENDER_USER",
  "ADMIN_EMAIL",
];

console.log("🔍 Checking environment variables...");
console.log("   AZ_TENANT_ID:", process.env.AZ_TENANT_ID ? "✓" : "✗");
console.log("   AZ_CLIENT_ID:", process.env.AZ_CLIENT_ID ? "✓" : "✗");
console.log("   AZ_CLIENT_SECRET:", process.env.AZ_CLIENT_SECRET ? "✓" : "✗");
console.log("   AZ_SENDER_USER:", process.env.AZ_SENDER_USER ? "✓" : "✗");
console.log("   ADMIN_EMAIL:", process.env.ADMIN_EMAIL ? "✓" : "✗");

const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("\n❌ Missing env vars:", missing.join(", "));
  console.error("   Make sure .env.local exists in the project root");
  process.exit(1);
}
console.log("✅ All required env vars present\n");

async function testEmail() {
  console.log("\n🔍 Testing Azure AD + Graph API Email...\n");

  // Step 1: Get token
  console.log("1️⃣ Requesting Azure AD token...");
  const tokenRes = await fetch(
    `https://login.microsoftonline.com/${process.env.AZ_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AZ_CLIENT_ID,
        client_secret: process.env.AZ_CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );

  if (!tokenRes.ok) {
    const error = await tokenRes.text();
    console.error("❌ Token request failed:", error);
    return;
  }

  const tokenData = await tokenRes.json();
  console.log("✅ Token acquired");

  // Step 2: Send test email
  console.log("\n2️⃣ Sending test email...");
  console.log(`   From: ${process.env.AZ_SENDER_USER}`);
  console.log(`   To: ${process.env.ADMIN_EMAIL}`);

  const message = {
    message: {
      subject: "🧪 Test Email from Neram Nexus API",
      body: {
        contentType: "HTML",
        content: `
          <h2>Test Email</h2>
          <p>This is a test email from the Neram Nexus submission flow.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        `,
      },
      toRecipients: [
        {
          emailAddress: {
            address: process.env.ADMIN_EMAIL,
          },
        },
      ],
    },
    saveToSentItems: true,
  };

  const mailRes = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
      process.env.AZ_SENDER_USER
    )}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    }
  );

  if (!mailRes.ok) {
    const error = await mailRes.text();
    console.error("❌ Email send failed:", error);
    try {
      const parsed = JSON.parse(error);
      console.error("\n📋 Error details:", JSON.stringify(parsed, null, 2));
    } catch {}
    return;
  }

  console.log("✅ Email sent successfully!");
  console.log(
    "\n📬 Check",
    process.env.ADMIN_EMAIL,
    "inbox (including spam folder)"
  );
}

testEmail().catch(console.error);
