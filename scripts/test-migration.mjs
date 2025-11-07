/**
 * Integration Test Script for users_duplicate Migration
 *
 * This script tests the updated API routes in development.
 * Run with: node scripts/test-migration.mjs
 *
 * Prerequisites:
 * 1. Dev server must be running (npm run dev)
 * 2. You need a valid Firebase ID token
 * 3. Supabase database must be accessible
 */

const BASE_URL = "http://localhost:3000";

// Test configuration
const config = {
  // Replace this with a real Firebase ID token for testing
  // You can get one from the browser console: await firebase.auth().currentUser.getIdToken()
  firebaseToken: process.env.TEST_FIREBASE_TOKEN || "",
  testEmail: "test@example.com",
  testUsername: "testuser123",
};

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  reset: "\x1b[0m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  console.log(`\n${colors.blue}━━━ ${name} ━━━${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, "green");
}

function logError(message) {
  log(`✗ ${message}`, "red");
}

function logWarning(message) {
  log(`⚠ ${message}`, "yellow");
}

async function testCheckUsername() {
  logTest("Test: Check Username Availability");

  try {
    const response = await fetch(`${BASE_URL}/api/auth/check-username`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: config.testUsername }),
    });

    const data = await response.json();

    if (response.ok && data.ok) {
      logSuccess(
        `Username check works: ${config.testUsername} is ${
          data.available ? "available" : "taken"
        }`
      );
      console.log("Response:", JSON.stringify(data, null, 2));
      return true;
    } else {
      logError(`Username check failed: ${data.error || "Unknown error"}`);
      return false;
    }
  } catch (error) {
    logError(`Username check error: ${error.message}`);
    return false;
  }
}

async function testCheckEmail() {
  logTest("Test: Check Email");

  try {
    const response = await fetch(
      `${BASE_URL}/api/auth/check-email?email=${encodeURIComponent(
        config.testEmail
      )}`
    );

    const data = await response.json();

    if (response.ok && data.ok) {
      logSuccess(
        `Email check works: Found ${data.providers.length} provider(s)`
      );
      console.log("Response:", JSON.stringify(data, null, 2));
      return true;
    } else {
      logError(`Email check failed: ${data.error || "Unknown error"}`);
      return false;
    }
  } catch (error) {
    logError(`Email check error: ${error.message}`);
    return false;
  }
}

async function testGetUserMe() {
  logTest("Test: GET /api/users/me");

  if (!config.firebaseToken) {
    logWarning(
      "Skipping: No Firebase token provided (set TEST_FIREBASE_TOKEN env var)"
    );
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${config.firebaseToken}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.ok) {
      logSuccess("User fetch works");
      if (data.user) {
        console.log("User data:", JSON.stringify(data.user, null, 2));
      } else {
        logWarning("No user found (might be expected for new account)");
      }
      return true;
    } else {
      logError(`User fetch failed: ${data.error || "Unknown error"}`);
      return false;
    }
  } catch (error) {
    logError(`User fetch error: ${error.message}`);
    return false;
  }
}

async function testUpsertUser() {
  logTest("Test: POST /api/users/upsert");

  if (!config.firebaseToken) {
    logWarning(
      "Skipping: No Firebase token provided (set TEST_FIREBASE_TOKEN env var)"
    );
    return null;
  }

  try {
    const testData = {
      student_name: "Test User",
      email: config.testEmail,
      gender: "male",
      city: "Test City",
      instagram_handle: "@testuser",
      education_type: "school",
      school_std: "12th",
      selected_course: "nata-jee",
    };

    const response = await fetch(`${BASE_URL}/api/users/upsert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.firebaseToken}`,
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();

    if (response.ok && data.ok) {
      logSuccess("User upsert works");
      console.log("User data:", JSON.stringify(data.user, null, 2));

      // Verify field mapping
      const user = data.user;
      if (user.student_name === testData.student_name) {
        logSuccess("Field mapping verified: student_name");
      }
      if (user.education_type === testData.education_type) {
        logSuccess("Field mapping verified: education_type");
      }
      if (user.selected_course === testData.selected_course) {
        logSuccess("Field mapping verified: selected_course");
      }

      return true;
    } else {
      logError(`User upsert failed: ${data.error || "Unknown error"}`);
      console.log("Response:", JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    logError(`User upsert error: ${error.message}`);
    return false;
  }
}

async function testAvatarUrl() {
  logTest("Test: GET /api/avatar-url");

  if (!config.firebaseToken) {
    logWarning("Skipping: No Firebase token provided");
    return null;
  }

  try {
    // Get current user first
    const meResponse = await fetch(`${BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${config.firebaseToken}` },
    });
    const meData = await meResponse.json();

    if (!meData.user?.firebase_uid && !meData.user?.id) {
      logWarning("No user ID found, skipping avatar URL test");
      return null;
    }

    const userId = meData.user.firebase_uid || meData.user.id;
    const response = await fetch(`${BASE_URL}/api/avatar-url?userId=${userId}`);

    if (response.status === 204) {
      logSuccess("Avatar URL check works (no avatar set - expected)");
      return true;
    }

    const data = await response.json();

    if (response.ok && data.signedUrl) {
      logSuccess("Avatar URL works");
      console.log("Signed URL generated");
      return true;
    } else {
      logWarning("Avatar URL returned no data (might be expected)");
      return true;
    }
  } catch (error) {
    logError(`Avatar URL error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log("\n" + "=".repeat(60));
  log("🧪 Testing users_duplicate Migration", "blue");
  console.log("=".repeat(60));

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  const tests = [
    { name: "Check Username", fn: testCheckUsername },
    { name: "Check Email", fn: testCheckEmail },
    { name: "Get User Me", fn: testGetUserMe },
    { name: "Upsert User", fn: testUpsertUser },
    { name: "Avatar URL", fn: testAvatarUrl },
  ];

  for (const test of tests) {
    const result = await test.fn();
    if (result === true) results.passed++;
    else if (result === false) results.failed++;
    else results.skipped++;
  }

  console.log("\n" + "=".repeat(60));
  log("📊 Test Results", "blue");
  console.log("=".repeat(60));
  logSuccess(`Passed: ${results.passed}`);
  if (results.failed > 0) logError(`Failed: ${results.failed}`);
  if (results.skipped > 0) logWarning(`Skipped: ${results.skipped}`);
  console.log("");

  if (results.failed > 0) {
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/users/me`, {
      headers: { Authorization: "Bearer test" },
    });
    return true;
  } catch (error) {
    logError(`Cannot connect to ${BASE_URL}`);
    logError("Make sure the dev server is running: npm run dev");
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }

  if (!config.firebaseToken) {
    logWarning("\n⚠️  No Firebase token provided");
    logWarning("Some tests will be skipped");
    logWarning(
      "To run all tests, set TEST_FIREBASE_TOKEN environment variable"
    );
    logWarning(
      "Get token from browser: await firebase.auth().currentUser.getIdToken()\n"
    );
  }

  await runAllTests();
}

main().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
