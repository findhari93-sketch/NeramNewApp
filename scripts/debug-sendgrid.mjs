/**
 * Debug SendGrid Configuration
 * Tests SendGrid API key validity and domain authentication
 *
 * Usage: node scripts/debug-sendgrid.mjs
 */

import { config } from "dotenv";
import https from "https";

// Load environment variables
config({ path: ".env.local" });

console.log("🔍 SendGrid Configuration Debug\n");

const API_KEY = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.MAIL_FROM;

if (!API_KEY || !FROM_EMAIL) {
  console.error("❌ Missing SMTP_PASS or MAIL_FROM in .env.local");
  process.exit(1);
}

console.log(`📧 Sender Email: ${FROM_EMAIL}`);
console.log(`🔑 API Key: ${API_KEY.substring(0, 15)}...`);
console.log("");

// Test 1: Verify API Key with SendGrid API
console.log("🧪 Test 1: Verifying API Key with SendGrid...");

function sendGridRequest(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.sendgrid.com",
      port: 443,
      path: path,
      method: method,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

try {
  // Check API Key Scopes
  const scopesResponse = await sendGridRequest("/v3/scopes");

  if (scopesResponse.status === 200) {
    console.log("✅ API Key is valid and active");
    console.log(
      "   Scopes:",
      scopesResponse.data?.scopes?.slice(0, 5).join(", ") || "All scopes"
    );
  } else if (scopesResponse.status === 401) {
    console.error("❌ API Key is INVALID or EXPIRED");
    console.log("   Action: Generate a new API key in SendGrid dashboard");
    console.log("   Go to: https://app.sendgrid.com/settings/api_keys");
  } else {
    console.error(`⚠️  Unexpected response: ${scopesResponse.status}`);
  }
  console.log("");

  // Test 2: Check Sender Authentication
  console.log("🧪 Test 2: Checking Sender Authentication...");
  const authResponse = await sendGridRequest("/v3/verified_senders");

  if (authResponse.status === 200) {
    const verifiedSenders = authResponse.data?.results || [];
    const fromDomain = FROM_EMAIL.split("@")[1];

    console.log(
      `📨 Checking if ${FROM_EMAIL} or domain ${fromDomain} is verified...`
    );

    if (verifiedSenders.length === 0) {
      console.error("❌ No verified senders found!");
      console.log("   Action: Verify your sender identity in SendGrid");
      console.log("   Go to: https://app.sendgrid.com/settings/sender_auth");
    } else {
      console.log(`✅ Found ${verifiedSenders.length} verified sender(s):`);
      verifiedSenders.forEach((sender, i) => {
        const isMatch = sender.from_email === FROM_EMAIL;
        console.log(
          `   ${i + 1}. ${sender.from_email} ${
            isMatch ? "← MATCHES" : ""
          } (verified: ${sender.verified})`
        );
      });

      const hasMatch = verifiedSenders.some(
        (s) => s.from_email === FROM_EMAIL && s.verified
      );
      if (!hasMatch) {
        console.log("");
        console.warn(`⚠️  ${FROM_EMAIL} is NOT in verified senders list!`);
        console.log(
          "   This is the most likely reason emails aren't being delivered."
        );
      }
    }
  }
  console.log("");

  // Test 3: Check Domain Authentication
  console.log("🧪 Test 3: Checking Domain Authentication...");
  const domainResponse = await sendGridRequest("/v3/whitelabel/domains");

  if (domainResponse.status === 200) {
    const domains = domainResponse.data || [];
    const fromDomain = FROM_EMAIL.split("@")[1];

    if (domains.length === 0) {
      console.error("❌ No authenticated domains found!");
      console.log("   Action: Authenticate your domain in SendGrid");
      console.log(
        "   Go to: https://app.sendgrid.com/settings/sender_auth/domains"
      );
    } else {
      console.log(`✅ Found ${domains.length} domain(s):`);
      domains.forEach((domain, i) => {
        const isMatch = domain.domain === fromDomain;
        console.log(
          `   ${i + 1}. ${domain.domain} ${
            isMatch ? "← MATCHES" : ""
          } (valid: ${domain.valid})`
        );
      });

      const matchingDomain = domains.find((d) => d.domain === fromDomain);
      if (!matchingDomain) {
        console.log("");
        console.warn(`⚠️  Domain ${fromDomain} is NOT authenticated!`);
        console.log(
          "   You must authenticate this domain before sending emails."
        );
      } else if (!matchingDomain.valid) {
        console.log("");
        console.warn(
          `⚠️  Domain ${fromDomain} is authenticated but DNS records are NOT valid!`
        );
        console.log(
          "   Check and update your DNS records in your domain registrar."
        );
      }
    }
  }
  console.log("");

  // Test 4: Send actual test email via SendGrid API
  console.log("🧪 Test 4: Sending test email via SendGrid API...");
  const testEmail =
    process.env.ADMIN_EMAILS?.split(",")[0] || "nexus-admin@neram.co.in";

  const emailPayload = {
    personalizations: [
      {
        to: [{ email: testEmail }],
        subject: "SendGrid API Test - Payment System",
      },
    ],
    from: {
      email: FROM_EMAIL,
      name: "Neram Classes Test",
    },
    content: [
      {
        type: "text/html",
        value: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>SendGrid API Test</h2>
          <p>If you receive this email, your SendGrid API configuration is working!</p>
          <p><strong>Sent via:</strong> SendGrid Web API (not SMTP)</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
      },
    ],
  };

  const sendResponse = await sendGridRequest(
    "/v3/mail/send",
    "POST",
    emailPayload
  );

  if (sendResponse.status === 202) {
    console.log("✅ Email sent successfully via SendGrid API!");
    console.log(`   To: ${testEmail}`);
    console.log("   Check your inbox in 1-2 minutes");
  } else {
    console.error(`❌ Failed to send email: ${sendResponse.status}`);
    console.log("   Response:", sendResponse.data);
  }
} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("📋 Summary & Next Steps:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
console.log("If emails are not being delivered, the most common issues are:\n");
console.log("1. ❌ Sender email not verified in SendGrid");
console.log(
  "   → Go to: https://app.sendgrid.com/settings/sender_auth/senders"
);
console.log("   → Add and verify: " + FROM_EMAIL + "\n");
console.log("2. ❌ Domain not authenticated");
console.log(
  "   → Go to: https://app.sendgrid.com/settings/sender_auth/domains"
);
console.log("   → Authenticate: " + FROM_EMAIL.split("@")[1] + "\n");
console.log("3. ❌ API Key expired or has wrong permissions");
console.log("   → Go to: https://app.sendgrid.com/settings/api_keys");
console.log('   → Create new key with "Mail Send" permission\n');
console.log("4. ⚠️  SendGrid account not verified");
console.log("   → Check: https://app.sendgrid.com/account/details\n");
