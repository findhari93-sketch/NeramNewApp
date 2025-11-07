/**
 * Manual Database Test
 * This script directly tests the Supabase queries to verify the table structure
 */

import { supabaseServer } from "../src/lib/supabaseServer.js";

async function testDatabaseQueries() {
  console.log("🔍 Testing Supabase queries for users_duplicate table\n");

  // Test 1: Check if table exists and get structure
  console.log("Test 1: Check table structure");
  try {
    const { data, error } = await supabaseServer
      .from("users_duplicate")
      .select("*")
      .limit(1);

    if (error) {
      console.error("❌ Error querying table:", error.message);
      console.error("Details:", error);
    } else {
      console.log("✅ Table accessible");
      if (data && data.length > 0) {
        console.log("Sample row columns:", Object.keys(data[0]));
      } else {
        console.log("Table is empty (expected for new setup)");
      }
    }
  } catch (err) {
    console.error("❌ Exception:", err.message);
  }

  // Test 2: Test JSONB filter on account->firebase_uid
  console.log("\nTest 2: JSONB filter on account->>firebase_uid");
  try {
    const { data, error } = await supabaseServer
      .from("users_duplicate")
      .select("*")
      .filter("account->>firebase_uid", "eq", "test-uid-123")
      .limit(1);

    if (error) {
      console.error("❌ Error with JSONB filter:", error.message);
    } else {
      console.log("✅ JSONB filter works");
      console.log("Results:", data?.length || 0, "rows");
    }
  } catch (err) {
    console.error("❌ Exception:", err.message);
  }

  // Test 3: Test JSONB filter on contact->email
  console.log("\nTest 3: JSONB filter on contact->>email");
  try {
    const { data, error } = await supabaseServer
      .from("users_duplicate")
      .select("account")
      .filter("contact->>email", "ilike", "test@example.com")
      .limit(1);

    if (error) {
      console.error("❌ Error with email filter:", error.message);
    } else {
      console.log("✅ Email filter works");
      console.log("Results:", data?.length || 0, "rows");
    }
  } catch (err) {
    console.error("❌ Exception:", err.message);
  }

  // Test 4: Test JSONB filter on account->username
  console.log("\nTest 4: JSONB filter on account->>username");
  try {
    const { data, error } = await supabaseServer
      .from("users_duplicate")
      .select("id")
      .filter("account->>username", "ilike", "testuser")
      .limit(1);

    if (error) {
      console.error("❌ Error with username filter:", error.message);
    } else {
      console.log("✅ Username filter works");
      console.log("Results:", data?.length || 0, "rows");
    }
  } catch (err) {
    console.error("❌ Exception:", err.message);
  }

  // Test 5: Insert test row
  console.log("\nTest 5: Insert test row");
  try {
    const testRow = {
      id: crypto.randomUUID(),
      selected_course: "nata-jee",
      nata_attempt_year: "2025-26",
      nata_calculator_sessions: {},
      account: {
        firebase_uid: "test-uid-" + Date.now(),
        username: "testuser" + Date.now(),
        display_name: "Test User",
      },
      basic: {
        student_name: "Test Student",
        gender: "male",
      },
      contact: {
        email: `test${Date.now()}@example.com`,
        phone: "+1234567890",
      },
      about_user: {},
      education: {
        education_type: "school",
      },
    };

    const { data, error } = await supabaseServer
      .from("users_duplicate")
      .insert(testRow)
      .select()
      .single();

    if (error) {
      console.error("❌ Insert error:", error.message);
      console.error("Details:", error);
    } else {
      console.log("✅ Insert works");
      console.log("Inserted ID:", data.id);

      // Clean up test row
      await supabaseServer.from("users_duplicate").delete().eq("id", data.id);
      console.log("✅ Test row cleaned up");
    }
  } catch (err) {
    console.error("❌ Exception:", err.message);
  }

  console.log("\n✨ Database tests complete\n");
}

testDatabaseQueries().catch(console.error);
