/**
 * Test script to verify email sending works
 * Run with: node test-email.js
 */

async function testEmailEndpoint() {
  const testEmail = "harrybabu93@gmail.com"; // CHANGE THIS to your email

  console.log("Testing email verification endpoint...");
  console.log("Sending to:", testEmail);

  try {
    const response = await fetch(
      "http://localhost:3000/api/auth/send-verification-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          studentName: "Test User",
        }),
      }
    );

    const data = await response.json();

    console.log("\n=== Response ===");
    console.log("Status:", response.status);
    console.log("Data:", JSON.stringify(data, null, 2));

    if (data.ok) {
      console.log("\n✅ SUCCESS! Check your email:", testEmail);
    } else {
      console.log("\n❌ FAILED!");
      console.log("Error:", data.error);
    }
  } catch (error) {
    console.error("\n❌ ERROR!");
    console.error(error);
  }
}

testEmailEndpoint();
